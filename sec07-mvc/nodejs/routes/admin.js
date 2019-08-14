const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

const products = [];

// GET /admin/add-product
router.get("/add-product", (req, res, next) => {
  // console.log("In the add product middleware!");
  // res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><input type="text" name="author"><button type="submit">Add Product</button></form>');

  // console.log("/add-product rootDir:", rootDir);
  // res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product", // Note property path value is arbitrary and will be used in our template to control UI features

    // Below allow us to add css files and control class behavior in main-layout.hbs
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
});

// POST /admin/add-product
router.post("/add-product", (req, res, next) => {
  //   console.log("In the post /add-product");
  console.log(req.body);

  products.push({ title: req.body.title }); // Pushing a new {} with title property but could have also pushed the req.body {} directly.
  res.redirect("/");
});

// module.exports = router;
exports.routes = router;
exports.products = products;
