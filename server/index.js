require("./mongoDB/mongoose");
const express = require("express");
const history = require("connect-history-api-fallback");
const http = require("http");
const roomRouter = require("./routes/room");
const roomControl = require("./controler/roomControl");
const userRouter = require("./routes/user")
const socketio = require("socket.io");
const moment = require("moment");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());

//Node can't use both express and socket
const serverSocket = http.createServer(app);
const io = socketio(serverSocket);

const port = process.env.PORT || 3000;

app.use(express.json());

app.use(roomRouter);
app.use(userRouter);

//listen to event from browser
io.on("connection", socket => {
  /*
   socket.emit // emit to that particular connection
  socket.broadcast.emit // emit to everybody exept that particular connection
  */

  socket.on("USER_JOIN", ({ username, room, ip }) => {
    /* //TEST
    console.log(user.time());
    console.log(socket.id)
    //
    // let today = moment()
    // let tomo = moment(today, "DD-MM-YYYY").add(12, 'hours');
    // console.log(tomo._d)
    */
    socket.join(room); // .join allows to join a specific room

    const id = socket.id;
    roomControl
      .setUserId(username, room, id, ip)

      .then(response => {
        // if (!response.alert) {
          //  const user = response.users.find(element => element.username === username)
          //  Object.assign(user, {status : "online"})

          socket.broadcast.to(room).emit("JOIN", {
            alert: `Le ${moment()
              .locale("fr")
              .format("lll")}, ${username} has join !`
          });
          io.to(room).emit("USERS_CONNECTED", { users: response.users });
          socket.emit("JOIN", {
            alert: `Welcome ${username} !`,
            expiration: response.expiration,
            admin: response.admin,
            blocked : response.blocked,
            ban : response.ban
          });
        // }
      });
  });

  socket.on("SEND_MESSAGE", ({ room, user, message }, callback) => {
    // callback is sending aknowledgment

    roomControl.storeMessages(room, user, message);
    
    io.to(room).emit("MESSAGE", {
      // emit to everybody
      user,
      message,
      time: moment()
        .locale("fr")
        .format("lll")
    });
    callback();

    socket.to(room).broadcast.emit("IS_TYPING", { length: 0, username: user });
  });

  socket.on("TYPING", ({ length, username, room }) => {
    socket.to(room).broadcast.emit("IS_TYPING", { length, username });
  });

  socket.on("SET_STATUS", ({ room, user, status }) => {
    roomControl.setStatus(room, user, status).then(response => {
      io.to(room).emit("UPDATE_STATUS", {
        users: response
      });
    });
  });

  socket.on("LOGOUT", () => {
    roomControl.logout(socket.id).then(resp => {
      socket.emit("LOG_OUT", { redirect: "/" });
      io.to(resp.room).emit("LEAVE", {
        alert: `${resp.username} has left !`,
        users: resp.users
      });
    });
  });

  socket.on("BAN_REQUEST", ({ room, user, ip, admin }) => {
    //BAN user from a given id
    // io.sockets.sockets[id].disconnect()
    roomControl.ban(room, user, ip).then((response) => {
      io.to(room).emit("BAN_RESPONSE", {
        user,
        admin,
        ban : response.ban
      });
    });
  });

  socket.on("UNBAN_REQUEST", ({ room, user, ip, admin }) => {
    roomControl.unban(room, user, ip).then((response) => {
      io.to(room).emit("UNBAN_RESPONSE", {
        user,
        admin,
        ban : response.ban
      });
    });
  });

  socket.on("BLOCK_REQUEST", ({ room, user, ip, admin }) => {
    roomControl.block(room, user, ip)
    .then(() => roomControl.setStatus(room, user, "blocked"))
    .then(response => {
      io.to(room).emit("BLOCK_RESPONSE", {
        user,
        admin,
        users : response
      });
    })
  });

  socket.on("UNBLOCK_REQUEST", ({ room, user, admin}) => {
    roomControl.unblock(room, user)
    .then(() => roomControl.setStatus(room, user, "online"))
    .then(response => {
      io.to(room).emit("UNBLOCK_RESPONSE", {
        user, 
        admin,
        users : response
      })
    })
  });
  

  socket.on("disconnect", () => {
    const id = socket.id;
    if (!id) {
      return;
    }
    roomControl.logout(id).then(resp => {
      io.to(resp.room).emit("LEAVE", {
        alert: `${resp.username} has left !`,
        users: resp.users
      });
    });
  });
});

app.use(history());
/* UNCOMMENT FOR PRODUCTION */

app.use(express.static(__dirname + '/public/' ));
serverSocket.listen(port, () => console.log("router is up on port" + port));
