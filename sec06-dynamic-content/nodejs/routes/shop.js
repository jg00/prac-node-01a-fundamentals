const path = require("path");

const express = require("express");

const rootDir = require("../util/path");
const adminData = require("./admin");

const router = express.Router();

router.get("/", (req, res, next) => {
  console.log("shop.js", adminData.products); // Note - This is possible to share data within our Node server scope.  Therefore shared across 'all' users.

  //   console.log(path.join(__dirname, "../", "views", "shop.html"));
  //   res.sendFile(path.join(__dirname, "../", "views", "shop.html"));
  //   res.sendFile(path.join(rootDir, "views", "shop.html"));
  res.render("shop");
});

module.exports = router;
