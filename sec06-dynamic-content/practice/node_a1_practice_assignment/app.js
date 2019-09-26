const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", "views");

const users = [];

app.get("/", (req, res, next) => {
  res.render("index", { title: "Home" });
});

app.post("/users", (req, res, next) => {
  users.push(req.body.name);
  res.render("users", { users: users, title: "User List" });
});

app.listen(3000, () => console.log("Server started!"));
