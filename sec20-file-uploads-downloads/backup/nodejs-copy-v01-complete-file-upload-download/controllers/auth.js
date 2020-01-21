const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user");
const { validationResult } = require("express-validator");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* Ref only.  Now using  @sendgrid/mail package only.
const nodemailer = require("nodemailer");
const sendgridTransport = require('nodemailer-sendgrid-transport') // deprecated

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "",
    host: "",
    // port: 25, // 465,
    // secure: false, // use SSL,
    // you can try with TLS, but port is then 587
    auth: {
      user: "",
      password: ""
    }
    // tls: {
    //   rejectUnauthorized: false
    // }
  })
);*/

// Ref only - set up SendGrid email service
/* 
  const transporter = nodemailer.createTransport(
    sendgridTransport({
      auth: {
        api_user: "optional",
        api_key: "required"
      }
    })
  );
 */

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
    errorMessage: message, // Retrieves [] of messages and then removes from session behind the scenes.
    oldInput: { email: "", password: "" },
    validationErrors: []
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
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    validationErrors: [] // initialize [] array of errros
  });
};

// Login button on Login page
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req); // returns [] of erros
  // console.log("HERE", errors.errors);
  // if (errors.errors.length > 0) {
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.errors[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array()
    });
  }

  /*
    1 Check email exists
    2 Check hashed passwords match
    3 Create/store a session to the database (done via MongoDBStore) and save session id on the clinet
    4 Note the use of if {} blocks and redirecting to different routes accorginly and how it affects the promises.
  */

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        // If no user we use connect-flash to flash an error message into our session.
        // flash(key, message)

        // No longer needed since we are no longer redirectin but instead rendering "auth/login" with status 422
        // req.flash("error", "Invalid email or password"); // Adds flash object into the current session.  Key feature of using session-flash is that it will stay there until we use it.

        // console.log(req.flash("error")); // convenience method returns array [] of messages.
        // return to not execute any code after this if block

        // Instead of redirecting sending status 422
        // return res.redirect("/login"); // Note a return only jumps us out of this function.  A promise will still be resolved because we are in a .then block and it will always trigger a .then().  However we intentionally did not add a .then to not fire but just a .catch in case of errors.

        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password",
          // errorMessage: errors.errors[0].msg, No longer needed since we are not flashing
          oldInput: { email: email, password: password },
          validationErrors: [] // Left as [] simply so we intentionally do not inform user of the error
        });
      }

      bcrypt
        .compare(password, user.password) // In both cases matches or not, we still make it to the .then(result-boolean) block. What bcrypt does is takes the string password and compares if it's hashed version would match the hashed password we have in the database
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            // Purpose return again is to not execute lines after res.redirect('/login') in this if block.  Again, we purposely did not include a .then.
            return req.session.save(err => {
              // console.log(err);
              res.redirect("/"); // no need for return because next code will not be reached nor executed.
            });
          }

          // replaced with render "auth/login" with status 422
          // req.flash("error", "Invalid email or password");
          // res.redirect("/login"); // no need for return because next code will not be reached nor executed.

          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password",
            // errorMessage: errors.errors[0].msg, No longer needed since we are not flashing
            oldInput: { email: email, password: password },
            validationErrors: [] // Left as [] simply so we intentionally do not inform user of the error
          });
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
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
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

  // Related to express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      // isAuthenticated: false
      // errorMessage: message // Retrieves [] of messages and then removes from session behind the scenes.
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      validationErrors: errors.array() // full [] array of errros
    });
  }

  // We no longer validate if email exists in the controller.  We moved the async validation
  // in the controller.

  // Only executed if we make it to the hashing step below (ie no user document found)

  bcrypt
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
      // Redirecting immediately is fine because we are not relying on the email being sent.
      res.redirect("/login");

      const msg = {
        to: email,
        from: "ShopNode@test.com",
        subject: "Signup succeeded!",
        text: "Log in to continue.",
        html: "<h1>You successfully signed up!</h1>"
      };

      return sgMail.send(msg);
    })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

// Good reference only before moving async code to find if email already exists to routes/auth as part of our validation.
// exports.postSignup = (req, res, next) => {
//   const { email, password } = req.body;

//   // Related to express-validator
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     console.log(errors.array());
//     return res.status(422).render("auth/signup", {
//       path: "/signup",
//       pageTitle: "Signup",
//       // isAuthenticated: false
//       // errorMessage: message // Retrieves [] of messages and then removes from session behind the scenes.
//       errorMessage: errors.array()[0].msg
//     });
//   }

//   User.findOne({ email: email })
//     .then(userDoc => {
//       if (userDoc) {
//         req.flash("error", "Email exists. Create a different email.");
//         return res.redirect("/signup"); // Remember this return will return a promise and 'will' execute the next .then block.  Note we didnt need a .then since we recirected.
//       }

//       // Only executed if we make it to the hashing step below (ie no user document found)
//       return (
//         bcrypt
//           .hash(password, 12) // returns a promise
//           .then(hashedPassword => {
//             // Remember that in our User Mongoose Schema user and email are required (May be good place for validation)
//             const user = new User({
//               email: email,
//               password: hashedPassword,
//               cart: { items: [] }
//             });

//             return user.save();
//           })
//           .then(result => {
//             // Redirecting immediately is fine because we are not relying on the email being sent.
//             res.redirect("/login");

//             const msg = {
//               to: email,
//               from: "ShopNode@test.com",
//               subject: "Signup succeeded!",
//               text: "Log in to continue.",
//               html: "<h1>You successfully signed up!</h1>"
//             };

//             return sgMail.send(msg);
//           })
//           // Prints out the reuslt of the return sgMail.send(msg)
//           // .then(emailMessage => {
//           //   console.log("EMAIL", emailMessage);
//           // })
//           .catch(err => {
//             console.log(err);
//           })
//         // , { test: "Test pass data along with bcrypt" }
//       );
//     })
//     // For return res.redirect or the res.bcrypt
//     // .then(result => {
//     //   console.log("CHECK IF RAN?", result);
//     // })
//     .catch(err => {
//       console.log(err);
//     });
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

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  // randomBytes() returns a Buffer that contain Hexadecimal values
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }

    // We can generate a token from that buffer that contains hexadecimal values.
    const token = buffer.toString("hex"); // "hex" is information toString() needs to convert hexadecimal values to string

    // Store token in database as part of the user object
    // Note at this point user is not logged in yet and therefore no user session yet.
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 3,600,000 Expressed in milliseconds for 1hr

        return user.save().then(result => {
          console.log("DOES THIS STILL RUN A?");
          res.redirect("/");
          console.log("DOES THIS STILL RUN B?");

          const msg = {
            to: req.body.email,
            from: "ShopNode@test.com",
            subject: "Password reset",
            html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
            `
          };

          sgMail.send(msg);
        });
      })

      // FIXED ABOVE
      // .then(result => {
      //   console.log("DOES THIS STILL RUN A?");
      //   res.redirect("/");
      //   console.log("DOES THIS STILL RUN B?");

      //   const msg = {
      //     to: req.body.email,
      //     from: "ShopNode@test.com",
      //     subject: "Password reset",
      //     html: `
      //     <p>You requested a password reset</p>
      //     <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
      //     `
      //   };

      //   sgMail.send(msg);
      // })

      .catch(err => {
        // console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500; // You can pass extra information with the error object.
        return next(err);
      });
  });
};

// Link from email with token; Only render auth/new-password if user with token (not expired) found.
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { userId, passwordToken, password: newPassword } = req.body;

  // console.log(userId, passwordToken, newPassword);

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect("/login");
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};
