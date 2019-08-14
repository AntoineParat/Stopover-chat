const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_KEY);

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
      res.send({ success: `You have been successfully unsubscribed. 
      You can still use our premium service till the end of your subscription period` });
    }
  } catch (err) {
    console.log(err);
    res.send({
      error: "We were not able to unsubscribed you. Please try again later"
    });
  }
};
