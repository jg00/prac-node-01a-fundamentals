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
  collection: "sessions"
});

const csrfProtection = csrf(); // returns a middleware function; You can also pass config params.

const errorController = require("./controllers/error");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

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
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  // console.log("SESSION USER", req.session.user); // Here session data fetched via MongoDBStore

  // To get our Mongoose model custom functions we need to fetch the user with the help of Mongoose.
  User.findById(req.session.user._id)
    .then(user => {
      // console.log("MONGOOSE MODEL USER", user);
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
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

app.use(errorController.get404);

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
