const User = require("../models/user");

// Navigation link "Login"
exports.getLogin = (req, res, next) => {
  // 2 Related to session.
  // console.log(req.session);
  // console.log(req.session.isLoggedIn); // Important - .isLoggedIn key is stored on the server

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    // isAuthenticated: isLoggedIn
    isAuthenticated: false
  });
};

// Login button on Login page
exports.postLogin = (req, res, next) => {
  // const { email, password } = req.body;

  /* 
    2 Session - Instead of using a cookie.
      - res.session -> session {} object
      - here we can add any keys we want.
  */

  User.findById("5de6ad7bafb5db05b6cf3739")
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user; // Mongoose user model object
      res.redirect("/"); // Important this ends the request cycle and starts a new request.  Therefore the req.isLoggedIn property is no longer available on our new request.
    })
    .catch(err => {
      console.log(err);
    });
};

/* 1 Related to configuring cookie header
// Navigation link "Login"
exports.getLogin = (req, res, next) => {
  // 2 Related to session.
  console.log(req.session);
  console.log(req.session.isLoggedIn); // Important - .isLoggedIn key is stored on the server

  // 1 Related to configuring cookie header
  // Extract cookie -> isLoggedIn=true
  // const isLoggedIn =
  //   req
  //     .get("Cookie")
  //     .split(";")[0]
  //     .trim()
  //     .split("=")[1] === "true";

  // console.log(req.get("Accept-Language"));

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    // isAuthenticated: isLoggedIn
    isAuthenticated: false
  });
};
*/
