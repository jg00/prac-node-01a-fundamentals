const express = require("express");
const { check, body } = require("express-validator"); // check function will return a middleware

const authController = require("../controllers/auth");

const router = express.Router(); // new router object

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", authController.postLogin);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.") // Optional custom message
      .custom((value, { req }) => {
        // Custom validation function
        if (value === "test@test.com") {
          throw new Error("This email address is forbidden.");
        }
        return true;
      }),

    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    ) // Adds a custom default message
      .isLength({ min: 5 })
      .isAlphanumeric(),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    })
  ],

  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword); // Link from email with token

router.post("/new-password", authController.postNewPassword);

module.exports = router;
