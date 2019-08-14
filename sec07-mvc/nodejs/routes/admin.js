const path = require("path");

const express = require("express");

// const rootDir = require("../util/path");

const productsController = require("../controllers/products");

const router = express.Router();

// const products = []; // moved to productsController

// GET /admin/add-product
router.get("/add-product", productsController.getAddProduct);

// POST /admin/add-product
router.post("/add-product", productsController.postAddProduct);

module.exports = router;
// no longer needed again after controller implemented
// exports.routes = router;
// exports.products = products;
