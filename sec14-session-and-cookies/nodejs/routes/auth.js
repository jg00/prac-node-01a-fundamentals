const express = require("express");
const router = express.Router(); // new router object

const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

module.exports = router;
