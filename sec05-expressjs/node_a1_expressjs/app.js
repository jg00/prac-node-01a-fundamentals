const express = require("express");
const app = express();

app.use("/favicon.ico", (req, res, next) => res.status(204));

app.use((req, res, next) => {
  console.log("Request url from: ", req.url);
  next();
});

app.use("/users", (req, res, next) => {
  res.send("<h1>Users</h1>");
});

app.use("/", (req, res, next) => {
  res.send("<h1>Main</h1>");
});

app.listen(3000, () => console.log("Server started!"));
