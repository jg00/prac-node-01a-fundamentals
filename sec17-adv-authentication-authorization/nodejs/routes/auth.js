const express = require("express");
const router = express.Router(); // new router object

const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post("/signup", authController.postSignup);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword); // Link from email with token

router.post("/new-password", authController.postNewPassword);

module.exports = router;
