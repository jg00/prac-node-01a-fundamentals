const path = require("path");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session); //Returns a single function that takes the session and returns a MongoDBStore class.
const csrf = require("csurf");
const flash = require("connect-flash");

const MONGODB_URI = `mongodb://bart:0BPmJVZdUUrIftYg@cluster0-shard-00-00-f9pzz.mongodb.net:27017,cluster0-shard-00-01-f9pzz.mongodb.net:27017,cluster0-shard-00-02-f9pzz.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`;
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions" // overrides shop collection specified in the MONGODB_URI
});

const csrfProtection = csrf(); // returns a middleware function; You can also pass config params.

const errorController = require("./controllers/error");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// console.log("SENDGRID:", process.env.SENDGRID_API_KEY);
// console.log("NODE_ENV:", process.env.NODE_ENV);

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Initialize a session.  Execute as a function and pass setup information.
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfProtection); // Any non-GET request your app will now look for CSRF token in your views.
app.use(flash()); // Now all requests will have a req.flash() function that can be used for flash messages.

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  // console.log("SESSION USER", req.session.user); // Here session data fetched via MongoDBStore

  // To get our Mongoose model custom functions we need to fetch the user with the help of Mongoose.
  User.findById(req.session.user._id)
    .then(user => {
      // console.log("MONGOOSE MODEL USER", user);

      // Extra check and handling if we do not find a user.  If user was deleted from db for example and we get undefined our app may crash and that is why we check here to handle what to do if user undefined.
      if (!user) {
        return next();
      }

      req.user = user; // store found user in the request object so for the "entire request" we can access that user object (it is a Mongoose user object)
      next();
    })
    .catch(err => {
      // console.log(err); // Note that not finding a user does not make this catch block fire.  It should fire on technical issues.

      // Again this catch block does not fire if we don't find a user with the id.  It will only fire if there are any technical issues (maybe no read access because server is down).
      // Throw error if we have some technical issue. There is a significat advantage of throwing the error here.
      // -> Expressjs gives us a way of handling these technical error issues when thrown.
      throw new Error(err);
      // next()  // Alternatively we could handle by continuing without a user being set
    });
});

// Set fields passed to the views.
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn; // Only set in controller/auth.js (postLogin)
  res.locals.csrfToken = req.csrfToken(); // generates a new token for every request which we can then use in our view.
  next();
});

/*  
app.use((req, res, next) => {
  User.findById("5de6ad7bafb5db05b6cf3739")
    .then(user => {
      req.user = user; // Mongoose user model object
      // req.user = new User(user.name, user.email, user.cart, user._id);
      // req.user = user; // { _id, name, email } returned.  We want our User object instance with our methods and properties.
      next();
    })
    .catch(err => {
      console.log(err);
    });
});
 */

// Routes middleware
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// 204: No Content
app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
});

app.get("/500", errorController.get500); // We could use to redirect to get error page

app.use(errorController.get404); // Catch all middleware if no page found

// Called from async code .catch((err) => return next(err)); Normally never reach this route.
// Express is smart enough to detech this signature and will move right away to this route if next(error) is executed.
// This is like a central Express Error Handling Middleware
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(..) // Status can be added here if you were to render() a 500 page.  This is just to show you can pass additional information.
  res.redirect("/500");
});

// Accomodate for deprecated functions like Product.findeOneAndRemove()
mongoose.set("useFindAndModify", false);

// Mongoose will manage one connection behind the scenes.  Our setup is different than when using the MongoDb driver.
mongoose
  .connect(
    // "mongodb://bart:0BPmJVZdUUrIftYg@cluster0-shard-00-00-f9pzz.mongodb.net:27017,cluster0-shard-00-01-f9pzz.mongodb.net:27017,cluster0-shard-00-02-f9pzz.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
    MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    /* Dummy user no longer needed
      // Test user with intialized cart - for now creating user(s) whenever we restart server
      User.findOne().then(user => {
        if (!user) {
          const user = new User({
            name: "Lisa",
            email: "lisa@test.com",
            cart: {
              items: []
            }
          });
          user.save();
        }
      });
  */
    app.listen(3000, () => console.log("Server Started"));
  })
  .catch(err => {
    console.log(err);
  });

// MongoDb using driver approach
// mongoConnect(() => {
//   app.listen(3000, () => console.log("Server Started"));
// });

/* Ref only - First approach where we got the client connection to the database.
  1 Connect to our database and get access to our client{] object to access our database
  2 and then start our server 

  mongoConnect(client => {
    console.log(client);
    app.listen(3000);
  });
*/
