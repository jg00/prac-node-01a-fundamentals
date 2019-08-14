const path = require("path");
const express = require("express");
const app = express();
// const bodyParser = require('body-Parser')

const users = [];

// app.use(bodyParser({extended: false}))
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", (req, res, next) => {
  res.render("index", { pageTitle: "Add User" });
});

app.get("/users", (req, res, next) => {
  res.render("users", { pageTitle: "Users", users: users });
});

app.post("/add-user", (req, res, next) => {
  users.push({ name: req.body.username });
  res.redirect("/users");
});

app.use("/", (req, res, next) => {
  res.redirect("/");
});

app.listen(3000, () => console.log("Server Started"));
