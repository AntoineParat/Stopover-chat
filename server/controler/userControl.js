const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.createUser = async (req, res) => {
  try {
    const check = await User.findOne({ email: req.body.email });
    if (check) {
      throw "A user already exists with this email address";
    }
    const password = await bcrypt.hash(req.body.password, 8);
    const user = await new User(req.body);
    user.password = password;
    await user.save();
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "12h"
    });
    res.cookie("user", token);
    res.send({ success: "You successfully registered", user : {userEmail : user.email, suscribtion : user.suscribtion } });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw "This email is unknown";
    }
    const checkPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!checkPassword) {
      throw "Password and email don't match";
    }
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "12h"
    });
    res.cookie("user", token);
    res.send({ success: "Welcome" + " " + user.email, user : {userEmail : user.email, suscribtion : user.suscribtion}  });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const decoded = await jwt.verify(req.cookies.user, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });
    res.send({ user : {userEmail: user.email, suscribtion : user.suscribtion } });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("user");
    res.send({ success: "disconnected" });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

exports.webhook = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.data.object.customer_email
    });

    user.cus_id = req.body.data.object.customer;
    user.sub_id = req.body.data.object.lines.data[0].subscription;
    user.suscribtion = "true";

    await user.save();

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });

   sgMail.send({
      to: user.email,
      from: "paratantoine@gmail.com",
      subject: `Premium membership`,
      html: `<p>Hello ${user.email},</p> 
              <p> Congratulations ! You are premium now !.</p>
              <p>You will be able to enjoy your chat app with no limitations !</p>
              <p>See you soon at <a href="https://stopover-chat.herokuapp.com"> stopover-chat </a></p>`
    });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteSubscription = async (req, res) => {
  try {
    const token = await req.cookies.user;
    if (!token) {
      throw "We are not able to find your credentials. Please try again later";
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    const deleteSubscription = await stripe.subscriptions.del(user.sub_id);

    if (deleteSubscription.status === "canceled") {
      user.suscribtion = "false";
      await user.save();
      await sgMail.send({
        to: user.email,
        from: "paratantoine@gmail.com",
        subject: `Good bye`,
        html: `<p>Hello,</p> 
                <p> You have been successfully unsubscribed.</p>
                <p>See you soon at <a href="https://stopover-chat.herokuapp.com"> stopover-chat </a></p>`
      });
      res.send({ success: "You have been successfully unsubscribed." });

    }
  } catch (err) {
    console.log(err);
    res.send({
      error: "We were not able to unsubscribed you. Please try again later"
    });
  }
};

exports.sendMail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email });
    if (!user) {
      throw "This email adress is unknown.";
      return;
    }

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "0.25h"
    });

    await sgMail.send({
      to: user.email,
      from: "paratantoine@gmail.com",
      subject: `Password reset`,
      html: `<p>Hello,</p> 
              <p> Follow this link to reset your password : https://stopover-chat.herokuapp.com/reset-password/${token} </p>
              <p>Be careful, this link in only available during 15 minutes</p
              <p>If you didn't tried to reset your password, contact us.</p>`
    });
    res.send({
      success: `An email has been sent to ${user.email} `
    });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const decoded = await jwt.verify(req.body.user, process.env.JWT_SECRET);
    const user = await User.findOne({_id : decoded._id});
    user.password = await bcrypt.hash(req.body.password, 8);
    await user.save();

    sgMail.send({
      to: user.email,
      from: "paratantoine@gmail.com",
      subject: `Password reset`,
      html: `<p>Hello,</p> 
              <p> Your password has been reseted. </p>
              <p> If you didn't tried to reset it, contact us.</p>
              <p>See you soon at <a href="https://stopover-chat.herokuapp.com"> stopover-chat </a>!</p>`
    });
    res.send({
      success: 'Password has been successfully reseted.'
    });
  } catch (err) {
    console.log(err);
    res.send({ error: err });
  }
};