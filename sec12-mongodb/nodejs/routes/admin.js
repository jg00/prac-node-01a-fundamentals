const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");

const router = express.Router();

// // GET /admin/products
router.get("/products", adminController.getProducts);

// GET /admin/add-product
router.get("/add-product", adminController.getAddProduct);

// POST /admin/add-product
router.post("/add-product", adminController.postAddProduct);

// GET /admin/edit-product/:productId
router.get("/edit-product/:productId", adminController.getEditProduct);

// // POST /admin/edit-product - Will not need to receive any dynamic params because since it is a POST request we can get data from req.body.
router.post("/edit-product", adminController.postEditProduct);

// // POST /admin/delete-product
// router.post("/delete-product", adminController.postDeleteProduct);

module.exports = router;
