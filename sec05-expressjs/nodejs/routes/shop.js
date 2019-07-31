const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  console.log("Hello from express middleware two!!");
  // res.setHeader("content-type", "text/plain");
  res.send("<h1>Hello from Express Two!</h1>");
});

module.exports = router;
