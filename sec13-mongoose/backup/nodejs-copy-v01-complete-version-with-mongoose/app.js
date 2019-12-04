const path = require("path");

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

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

// Routes middleware
app.use("/admin", adminRoutes);
app.use(shopRoutes);

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
    "mongodb://bart:0BPmJVZdUUrIftYg@cluster0-shard-00-00-f9pzz.mongodb.net:27017,cluster0-shard-00-01-f9pzz.mongodb.net:27017,cluster0-shard-00-02-f9pzz.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
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
