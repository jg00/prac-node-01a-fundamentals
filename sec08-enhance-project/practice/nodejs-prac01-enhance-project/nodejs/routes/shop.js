const path = require("path");

const express = require("express");

// const productsController = require("../controllers/products");
const shopController = require("../controllers/shop");

// const mainControllers = require("../controllers/mainController");

const router = express.Router();

// router.get("/", mainControllers.shopController);

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/cart", shopController.getCart);

router.get("/checkout", shopController.getCheckout);

module.exports = router;
