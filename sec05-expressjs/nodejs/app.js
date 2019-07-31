// const http = require("http");

const express = require("express");

const app = express();

app.use("/", (req, res, next) => {
  console.log("This always runs");
  next();
});

app.use("/add-product", (req, res, next) => {
  console.log("In the add product middleware!");
  // res.setHeader("content-type", "text/plain");
  res.send('<h1>The "Add Product" Page</h1>');
});

app.use("/", (req, res, next) => {
  console.log("In hello from express middleware!");
  // res.setHeader("content-type", "text/plain");
  res.send("<h1>Hello from Express Two!</h1>");
});

// 204: No Content
app.get("/favicon.ico", (req, res, next) => res.status(204));

app.listen(3000);

// Works as well
// const server = http.createServer(app);
// server.listen(3000);
