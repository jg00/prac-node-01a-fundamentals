const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Navigation link "Login"
exports.getLogin = (req, res, next) => {
  // 2 Related to session.
  // console.log(req.session);
  // console.log(req.session.isLoggedIn); // Important - .isLoggedIn key is stored on the server

  // console.log(req.flash("error")); // [ 'Invalid email or password' ]

  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    // isAuthenticated: isLoggedIn
    // isAuthenticated: false

    // errorMessage: req.flash("error") // Retrieves [] of messages and then removes from session behind the scenes.
    errorMessage: message // Retrieves [] of messages and then removes from session behind the scenes.
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    // isAuthenticated: false
    errorMessage: message
  });
};

// Login button on Login page
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  /*
    1 Check email exists
    2 Check hashed passwords match
    3 Create/store a session to the database (done via MongoDBStore) and save session id on the clinet
    4 Note the use of if {} blocks and redirecting to different routes accorginly and how it affects the promises.
  */

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        // If not user we use connect-flash to flash an error message into our session.
        // flash(key, message)
        req.flash("error", "Invalid email or password"); // this will place in the session.  Key feature  of using session-flash is that it will stay there until we use it.
        // console.log(req.flash("error")); // convenience method returns array [] of messages.
        // return to not execute any code after this if block
        return res.redirect("/login"); // Note a return will always resolve a promise and trigger a .then().  However we intentionally did not add a .then to not fire but just a .catch in case of errors.
      }

      bcrypt
        .compare(password, user.password) // In both cases matches or not, we still make it to the .then(result-boolean) block. What bcrypt does is takes the string password and compares if it's hashed version would match the hashed password we have in the database
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            // Purpose return again is to not execute the of line res.redirect('/login') after this if block.  Again, we purposely did not include a .then.
            return req.session.save(err => {
              // console.log(err);
              res.redirect("/"); // no need for return because next code will not be reached nor executed.
            });
          }

          req.flash("error", "Invalid email or password");
          res.redirect("/login"); // no need for return because next code will not be reached nor executed.
        })
        // Test only - always fires after above .then block
        // .then(blah => {
        //   console.log("BLAH");
        // })
        .catch(err => {
          // Error if bcrypt fails the compare(password, user.password)
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch(err => console.log(err));
};

// Reference only - Login page wtih test user only
// // Login button on Login page
// exports.postLogin = (req, res, next) => {
//   // const { email, password } = req.body;

//   /*
//     2 Session - Instead of using a cookie.
//       - res.session -> session {} object
//       - here we can add any keys we want.
//   */

//   User.findById("5de6ad7bafb5db05b6cf3739")
//     .then(user => {
//       req.session.isLoggedIn = true;

//       /*
//         Note
//         1a This is just the user data stored in our session object.(req.session.user.addToCart is not a function)
//         1b It does not include our user model functions.
//         2 (Important) For every new request, the session middleware does not go ahead
//         and fetch the user with the help of Mongoose.  It fetches the session data
//         from MongoDb and that is correct "but" for that, "it uses the MongoDBStore".
//         -> The MongoDBStore does not know about our Mongoose models.  So when it fetches the data
//         from MongoDB, it only fetches the data.  It does not fetch an object with all the methods
//         provided by Mongoose.
//       */
//       req.session.user = user; // What is stored in the session is just a regular user.

//       // To be sure your session is saved to database before redirect use the req.session.save() to safely redirect.
//       req.session.save(() => {
//         res.redirect("/");
//       });

//       // res.redirect("/"); // Important this ends the request cycle and starts a new request.  Therefore the req.isLoggedIn property is no longer available on our new request.
//     })
//     .catch(err => {
//       console.log(err);
//     });
// };

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash("error", "Email exists. Create a different email.");
        return res.redirect("/signup"); // Remember this return will return a promise and 'will' execute the next .then block.  Note we didnt need a .then since we recirected.
      }

      // Only executed if we make it to the hashing step below (ie no user document found)
      return bcrypt
        .hash(password, 12) // returns a promise
        .then(hashedPassword => {
          // Remember that in our User Mongoose Schema user and email are required (May be good place for validation)
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });

          return user.save();
        })
        .then(result => {
          res.redirect("login");
        });
    })
    .catch(err => {
      console.log(err);
    });
};

// Nested after the .hash() above
// .then(hashedPassword => {
//   const user = new User({
//     email: email,
//     password: hashedPassword,
//     cart: { items: [] }
//   });

//   return user.save();
// })
// .then(result => {
//   res.redirect("login");
// })

// .catch(err => {
//   console.log(err);
// });
// };

exports.postLogout = (req, res, next) => {
  // console.log("test logout");
  // All session data will now be lost.
  req.session.destroy(err => {
    // console.log(err);
    res.redirect("/login");
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
