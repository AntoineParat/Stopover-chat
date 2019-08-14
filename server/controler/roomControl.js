const moment = require("moment");
const Room = require("../model/room");
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requestIp = require("request-ip");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_KEY);

exports.createRoom = async (req, res) => {
  try {
    let subscriber = false;

    //Je cherche le status de la souscription via stripe API (aussi faisable avec webhook)
    if (req.cookies.user) {
      const decoded = await jwt.verify(
        req.cookies.user,
        process.env.JWT_SECRET
      );
      const user = await User.findOne({ _id: decoded._id });
      const subscription = await stripe.subscriptions.retrieve(user.sub_id);
      if (subscription) {
        subscriber = subscription.status;
      }
    }

     const clientIp = requestIp.getClientIp(req);
    const checkIp = await Room.findOne({ adminIp: clientIp });

    if (checkIp && subscriber !== "trialing" && subscriber !== "active") {
      throw "As a free user, you can't create more than one room per 12h";
    }

    const checkRoom = await Room.findOne({ name: req.body.name });
    if (checkRoom) {
      throw "A room with the same name already exists";
    }

    const room = new Room(req.body);
    if (req.body.password) {
      const password = await bcrypt.hash(req.body.password, 8);
      room.password = password;
    }

    room.admin = req.body.admin;
    room.adminIp = clientIp;

    const createdAt = moment().format();
    room.createdAt = createdAt;
    const expiration = moment().add(12, "hours");
    room.expiration = expiration;

    await room.save();
    res.send({ success: "Your room has been created !" });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const room = await Room.findOne({ name: req.body.name });
    if (!room) {
      throw "This room doesn't exist yet !";
    }
    const alreadyTaken = room.users.find(
      element => element.username === req.body.username
    );
    if (alreadyTaken) {
      throw "This username is already taken !";
    }
    if (
      // room.ban.find(element => element.ip === clientIp) ||  // enlever l'ip pour test sur un seul ordi
      room.ban.find(element => element.user === req.body.username) // elever pseudo pour prod
    ) {
      throw "You have been banned from this room !";
    }
    if (room.password === null) {
      return res.send({ isPublic: true, ip: clientIp });
    }
    if (room.password && req.body.password === null) {
      return res.send({
        private: "This is a private room, please enter a password"
      });
    }
    const check = await bcrypt.compare(req.body.password, room.password);
    if (!check) {
      return res.send({ wrongPass: "Wrong password" });
    }
    return res.send({ isPrivate: true, ip: clientIp });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

exports.setUserId = async (username, room, id, ip) => {
  try {
    const findRoom = await Room.findOne({ name: room });

    // Check for blocked user
    const blocked = findRoom.blocked.find(
      element => element.user === username /*|| element.ip === ip*/
    );
    if (!blocked) {
      findRoom.users.push({
        username: username,
        id: id,
        ip: ip,
        status: "online"
      }); // "online by default on login"
    } else {
      findRoom.users.push({
        username: username,
        id: id,
        ip: ip,
        status: "blocked"
      });
    }
    await findRoom.save();
    return new Promise(resolve => {
      resolve({
        users: findRoom.users,
        expiration: findRoom.expiration,
        admin: findRoom.admin,
        blocked: blocked,
        ban: findRoom.ban
      });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.setStatus = async (room, username, status) => {
  const findRoom = await Room.findOne({ name: room });
  const user = findRoom.users.find(element => element.username === username);
  //Pour une raison que j'ignore, mongoose ne save pas l'update en utilisant .dot
  //je dois donc utiliser la méthode .set()
  //qui implique de récupérer l'index et de réécrire tout l'objet
  const index = findRoom.users.indexOf(user);
  Object.assign(user, { status: status });
  findRoom.users.set(index, user);
  await findRoom.save();
  return new Promise(resolve => {
    resolve(findRoom.users);
  });
};

exports.block = async (room, user, ip) => {
  try {
    const findRoom = await Room.findOne({ name: room });
    findRoom.blocked.push({ user, ip });
    await findRoom.save();
    return new Promise(resolve => {
      resolve("ok");
    });
  } catch (err) {
    console.log(err);
  }
};

exports.unblock = async (room, user) => {
  try {
    const findRoom = await Room.findOne({ name: room });
    const toDelete = findRoom.blocked
      .map(function(element) {
        return element.user;
      })
      .indexOf(user);
    findRoom.blocked.splice(toDelete, 1);
    await findRoom.save();
    return new Promise(resolve => {
      resolve("ok");
    });
  } catch (err) {
    console.log(err);
  }
};

exports.ban = async (room, user, ip) => {
  try {
    const findRoom = await Room.findOne({ name: room });
    findRoom.ban.push({ user, ip });
    await findRoom.save();
    return new Promise(resolve => {
      resolve({ ban: findRoom.ban });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.unban = async (room, user, ip) => {
  try {
    const findRoom = await Room.findOne({ name: room });
    const toDelete = findRoom.ban
      .map(function(element) {
        return element.user;
      })
      .indexOf(user);
    findRoom.ban.splice(toDelete, 1);
    await findRoom.save();
    return new Promise(resolve => {
      resolve({ ban: findRoom.ban });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = async id => {
  try {
    const room = await Room.findOne({ "users.id": id }); // search for one condition in an array of objects
    const user = room.users.find(element => element.id === id);
    const toDelete = room.users
      .map(function(item) {
        return item.id;
      })
      .indexOf(id);
    await room.users.splice(toDelete, 1);
    await room.save();
    return new Promise(resolve => {
      resolve({ room: room.name, users: room.users, username: user.username });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.storeMessages = async (room, user, message) => {
  const findRoom = await Room.findOne({ name: room });
  const createdAt = new Date().getTime();
  const date = moment()
    .locale("fr")
    .format("lll");
  findRoom.messages.push({ createdAt, user, date, message });
  await findRoom.save();
};

exports.getHistory = async (req, res) => {
  try {
    const room = await Room.findOne({ name: req.query.room });
    const messages = room.messages;
    const userMessages = messages.filter(e => e.createdAt > req.query.date);

    const pdfName = `${req.query.username}-fly-away-history.pdf`;
    const pdfPath = path.join("server/data", "pdf", pdfName);

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-disposition", `filename="${pdfName}"`);
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.pipe(res);

    doc.text(req.query.username + ", here is your history for this session :", {
      align: "center",
      stroke: true
    });
    doc.moveDown();
    doc.moveDown();

    for (let message of userMessages) {
      doc.text(`${message.user}, le ${message.date} :`);
      doc.text(message.message);
      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    console.log(err);
  }
};
