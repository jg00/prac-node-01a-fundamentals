const path = require("path");

const express = require("express");

// const rootDir = require("../util/path");

const adminController = require("../controllers/admin");

const router = express.Router();

// const products = []; // moved to adminController

// GET /admin/add-product
router.get("/add-product", adminController.getAddProduct);

// GET /admin/products
router.get("/products", adminController.getProducts);

// POST /admin/add-product
router.post("/add-product", adminController.postAddProduct);

module.exports = router;
// no longer needed again after controller implemented
// exports.routes = router;
// exports.products = products;
