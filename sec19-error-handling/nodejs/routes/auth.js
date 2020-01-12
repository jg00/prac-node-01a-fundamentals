const express = require("express");
const { check, body } = require("express-validator"); // check function will return a middleware

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router(); // new router object

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",

  [
    body("email")
      .isEmail()
      .withMessage("Enter valid email.")
      .normalizeEmail(), // Sanitizer

    body(
      "password",
      "Password must be at least 5 characters and alphanumeric only."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim() // Sanitizer
  ],

  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.") // Optional custom message
      // Note that .custom is looking for a returned true/false, a thrown error, or to return a Promise
      .custom((value, { req }) => {
        // // Custom validation function
        // if (value === "test@test.com") {
        //   throw new Error("This email address is forbidden.");
        // }
        // return true;

        // Async code will return a Promise.resolve or Promise.reject
        // By using a "return User.find.." the express-validator custom() "will wait for the async operation to complete" and will recieve either a Promise.resolve or Promise.reject.
        // If a Promise.reject is returned, then express-validator will store the error message that can later be accessed with validationResult(req) function
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject("E-mail exists. Create a different email.");
          }

          // Remember that every .then block implicitly returns a new Promise.
          // If the code execution reaches this line of code after the if() block above, it is assumed that a Promise.resolve occured and is returned.
        });
      })
      .normalizeEmail(), // Sanitizer

    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    ) // Adds a custom default message
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(), // Sanitizer

    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
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

// Ref only before moving async code to find if email already exists to routes/auth as part of our validation.
// router.post(
//   "/signup",
//   [
//     check("email")
//       .isEmail()
//       .withMessage("Please enter a valid email.") // Optional custom message
//       .custom((value, { req }) => {
//         // Custom validation function
//         if (value === "test@test.com") {
//           throw new Error("This email address is forbidden.");
//         }
//         return true;
//       }),

//     body(
//       "password",
//       "Please enter a password with only numbers and text and at least 5 characters."
//     ) // Adds a custom default message
//       .isLength({ min: 5 })
//       .isAlphanumeric(),

//     body("confirmPassword").custom((value, { req }) => {
//       if (value !== req.body.password) {
//         throw new Error("Passwords have to match!");
//       }
//       return true;
//     })
//   ],

//   authController.postSignup
// );
