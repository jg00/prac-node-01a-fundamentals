const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const { check, body } = require("express-validator");

const router = express.Router();

// GET /admin/products
router.get("/products", isAuth, adminController.getProducts);

// GET /admin/add-product
router.get("/add-product", isAuth, adminController.getAddProduct);

// POST /admin/add-product
router.post(
  "/add-product",
  [
    check("title")
      .isString()
      .isLength({ min: 3 })
      .trim(),

    check("imageUrl").isURL(),

    body("price").isFloat(),

    body("description")
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddProduct
);

// GET /admin/edit-product/:productId
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// // POST /admin/edit-product - Will not need to receive any dynamic params because since it is a POST request we can get data from req.body.
router.post(
  "/edit-product",

  [
    check("title")
      .isAlphanumeric()
      .isLength({ min: 3 })
      .trim(),

    check("imageUrl").isURL(),

    body("price").isFloat(),

    body("description")
      .isLength({ min: 5, max: 400 })
      .trim()
  ],

  isAuth,
  adminController.postEditProduct
);

// // POST /admin/delete-product
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
