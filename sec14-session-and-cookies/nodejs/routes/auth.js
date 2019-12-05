const express = require("express");
const router = express.Router(); // new router object

const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);

module.exports = router;
