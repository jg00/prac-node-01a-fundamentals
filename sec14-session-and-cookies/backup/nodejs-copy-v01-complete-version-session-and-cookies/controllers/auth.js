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

      /*
        Note 
        1a This is just the user data stored in our session object.(req.session.user.addToCart is not a function)
        1b It does not include our user model functions.
        2 (Important) For every new request, the session middleware does not go ahead
        and fetch the user with the help of Mongoose.  It fetches the session data
        from MongoDb and that is correct "but" for that, "it uses the MongoDBStore".
        -> The MongoDBStore does not know about our Mongoose models.  So when it fetches the data
        from MongoDB, it only fetches the data.  It does not fetch an object with all the methods
        provided by Mongoose.
      */
      req.session.user = user; // What is stored in the session is just a regular user.

      // To be sure your session is saved to database before redirect use the req.session.save() to safely redirect.
      req.session.save(() => {
        res.redirect("/");
      });

      // res.redirect("/"); // Important this ends the request cycle and starts a new request.  Therefore the req.isLoggedIn property is no longer available on our new request.
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

exports.postLogout = (req, res, next) => {
  // console.log("test logout");
  // All session data will now be lost.
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/login");
  });
};
