const path = require("path");

const express = require("express");

// const rootDir = require("../util/path");
const adminData = require("./admin");

const router = express.Router();

router.get("/", (req, res, next) => {
  // console.log(path.join(__dirname, "../", "views", "shop.html"));
  // res.sendFile(path.join(__dirname, "../", "views", "shop.html"));
  // res.sendFile(path.join(rootDir, "views", "shop.html"));

  console.log("shop.js", adminData.products); // Note - This is possible to share data within our Node server scope.  Therefore shared across 'all' users.
  const products = adminData.products; // [ {title: 'a'}, {title: 'b'}]

  res.render("shop", {
    prods: products, // Inject as an object with a key name that we can refer to in the template.
    pageTitle: "Shop",
    path: "/",
    hasProducts: products.length > 0, // For handlebars that only handles true/false.  Conditional stmts not allowed with handlebars.
    activeShop: true,
    productCSS: true
    // layout: false // Special handlebars 'layout' key to disable default behavior of handlebars to use template.
  });
});

module.exports = router;
