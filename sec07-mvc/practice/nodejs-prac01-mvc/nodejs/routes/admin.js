const path = require("path");

const express = require("express");

const rootDir = require("../util/path");

const router = express.Router();

const products = [];

// GET /admin/add-product
router.get("/add-product", (req, res, next) => {
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product" // Note property path value is arbitrary and will be used in our template to control UI features

    // Below allow us to add css files and control class behavior in main-layout.hbs
    // formsCSS: true,
    // productCSS: true,
    // activeAddProduct: true
  });
});

// POST /admin/add-product
router.post("/add-product", (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect("/");
});

// module.exports = router;
exports.routes = router;
exports.products = products;
