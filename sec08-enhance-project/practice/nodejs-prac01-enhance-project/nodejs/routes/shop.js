const path = require("path");

const express = require("express");

const productsController = require("../controllers/products");

// const mainControllers = require("../controllers/mainController");

const router = express.Router();

// router.get("/", mainControllers.shopController);

router.get("/", productsController.getProducts);

module.exports = router;
