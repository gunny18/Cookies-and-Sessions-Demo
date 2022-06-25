// const functions = require("firebase-functions/v1");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const engine = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

const app = express();

mongoose
  .connect("mongodb://localhost:27017/AuthDemo2")
  .then(() => {
    console.log("MONGO Connection Successfull");
  })
  .catch((e) => {
    console.log("Oh no MONGO connection error");
    console.log(e);
  });

app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(cookieParser("A Top scret message"));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

//middleware to see if user is logged in, so we can use to verify multiple endpoints/routes
const requiredLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
    //either return this or warp next() with else block....
  }
  next();
};

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/docs", (req, res) => {
  res.render("docs");
});

app.get("/about", (req, res) => {
  res.render("about");
});

// app.get("/session-app", (req, res) => {
//   res.render("sessions");
// });

// app.post("/session-app", (req, res) => {
//   const { username, email, age, password } = req.body;
//   req.session.username = username;
// });

app.get("/cookie-app", (req, res) => {
  res.render("cookie");
});

// app.get("/showCookie", (req, res) => {
//   res.render("showCookie");
// });

app.post("/cookie-app", (req, res) => {
  const { username, age, password, email } = req.body;
  res.cookie("username", username);
  res.cookie("age", age);
  res.cookie("email", email);
  res.cookie("password", password, { signed: true });
  cookie = req.cookies;
  signedCookie = req.signedCookies;
  res.render("showCookie", { cookie, signedCookie });
  // res.send(req.signedCookies);
});

app.get("/session-app", (req, res) => {
  res.render("sessions");
});

app.post("/session-app", async (req, res) => {
  const { username, password, age, email } = req.body;
  const hash = await bcrypt.hash(password, 12);
  // res.send(hash);
  const user = new User({
    username: username,
    password: hash,
    email: email,
    age: age,
  });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  // res.send(req.body);
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  const validUser = await bcrypt.compare(password, user.password);
  if (validUser) {
    req.session.user_id = user._id;
    // res.send('Login Successfull!');
    res.redirect("/secret");
  } else {
    // res.send('Invalid username or password');
    res.redirect("/login");
  }
});
//now we have some form setup to validate credentials
//now with help of sessions and cookies we can help browser remember the uer to stay logged in
//since we use express session package we will already see a cookie sent with the session id
//so now we can store info in the session store and browser willsend us those info after verifying session id
//as a start we just store the mongo id for a user in the session to stay logged in unless user logs out or session expires
//we add this logic even when registering a user coze it makes sense that if someone signs up they automatically log in too

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  //Another way to logout is to destroy the entire session itself
  //This is useful if we have a lot of info about the user stored
  // req.session.destroy();
  res.redirect("/login");
});

app.get("/secret", requiredLogin, (req, res) => {
  // if (!req.session.user_id) {
  //     res.redirect('/login');
  // } else {
  //     res.render('secret');
  // }
  //used a middleware callback to verify if a user is logged in
  res.render("secret");
});

const port = process.env.PORT || 3100;
app.listen(port, () => {
  console.log("Listening on Port 3100");
});

// exports.app = functions.https.onRequest(app);
