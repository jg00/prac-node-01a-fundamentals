const path = require("path");

const express = require("express");
const app = express();

const errorController = require("./controllers/error");

/* Sequelize db connection and connection pool */
const sequelize = require("./util/database");

/* Sequelize import models to define relations.
  - Side note - sequelize.sync() was not aware of user until it was imported below.
*/
const Product = require("./models/product");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

/* 
  Idea here is to get a the user we can use throughout our application.     
  app.use() only registers middleware.
  For every incoming request this will execute and reach out to our User table
*/
app.use((res, req, next) => {
  User.findByPk(1)
    .then(user => {
      // Remember what is returned above is a sequelize object we reference as user.
      // So in the future when we call this user, we can execute sequelize methods like .destroy(), etc.
      // We want to store our user by simply adding to our request object. (Just make sure we don't overwrite an existing one
      // like req.body)
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

// 204: No Content
app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
});

app.use(errorController.get404);

/*
  Describe Sequelize table relations prior to syncing.
  1 Import models above
  2 Describe model relations prior to sync.
*/

/* 
  Relation in the sense of a user created the product. 
  Product <-- Has many -- User 
*/
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product); // Optional but you can also define the inverse and/or both

/* 
  sync() function 
  - is aware of all our models
  - creates any tables that do not exists (sequelize creates the sql query for these in the backgrund)
      CREATE TABLE IF NOT EXISTS `products` (id....)
  - table names are pluralized ex: 'product' becomes 'products'

  - Side note - npm start is what runs sequelize code below.
*/
sequelize
  // .sync({ force: true }) // Not something you should use in Production
  .sync()
  .then(result => {
    // console.log(result);

    // For now create a dummy user if not found
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: "Sam", email: "sam@test.com" }); // Returns a promise
    }
    return Promise.resolve(user); // We want to be consistent to return a promise.  Technically you can remove Promise.resolve() because it automatically returns a promise in a .then block
  })
  .then(user => {
    // console.log(user);
    app.listen(3000); // Only start server if we make the database connection using sequelize
  })
  .catch(err => console.log(err));

/*
Reference database connection test only
  db.execute("SELECT * FROM products")
    .then(result => {
      console.log(result[0], result[1]);
    })
    .catch(err => {
      console.log(err);
    });
*/
