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
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

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

  For now user with id = 1 always exists because it was created during the sequelize.sync() step.
*/
app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      // Remember what is returned above is a sequelize object we reference as user and not just a simple object.
      // So in the future when we call this user, we can execute sequelize methods like .destroy(), etc.
      // We want to store our user by simply adding to our request object. (Just make sure we
      // don't overwrite an existing property like  our req.body)
      req.user = user;
      // console.log("HERE", req.user.id);
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
  Model relation 1 - User/Product
  Relation in the sense of a user created the product. 
  User hasMany Product (1:m) - remember .hasMany() can be used to create an association that is either 1:m or n:m.
  Product belongsTo User (1:1)
*/
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" }); // Product.userId (FK) added
User.hasMany(Product); // Optional but you can also define the inverse and/or both.  Product.userId (FK) added.  user instance gets .createProduct(), .getProducts()

/*
  Model relation 2: Cart/User
  Cart belongsTo User (1:1)
  Either appoach will add instance methods to the Cart.
    
*/
User.hasOne(Cart); // Cart.userId (FK) added.  User instance gets .getCart()
Cart.belongsTo(User); // Cart.userId (FK) added; inverse relation.

/*
  Model relation 3: Cart -> CartItem <- Product
  Cart belongsToMany Product (m:m) - many to many relation because
    - a Cart can have multiple products
    - and a single Product can be part of many different Carts
  
  This only works with an intermediate Model (ie CartItem Model) that connects them.
    - {through:CartItem} tells sequelize where these connections should be stored.  By default the connections are stored in ProductCart (source + target) 
*/
Cart.belongsToMany(Product, { through: CartItem }); // CartItems.productId (FK) added.
Product.belongsToMany(Cart, { through: CartItem }); // CartItems.cartId (FK) added.

/*
  Model relation 4: User/Order 
*/
Order.belongsTo(User); // getUser, setUser, crateUser
User.hasMany(Order); // getOrders, addOrder, addOrders, createOrder

/*
  Model relation 5: Order/Product 
*/
Order.belongsToMany(Product, { through: OrderItem }); // getProducts, createProduct
// Product.belongsToMany(Order, { through: OrderItem }); // You can define inverse but not need here.

/* 
  Sequelize sync - create/update database tables
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

    // Check methods
    // console.log("MAGIC", Object.keys(Cart.prototype)); // cart.addProducts, cart.getProducts, etc
    // console.log("MAGIC", Object.keys(Product.prototype)); // product.addCarts, product.getCarts, etc
    console.log("MAGIC", Object.keys(Order.prototype)); // product.addCarts, product.getCarts, etc
    console.log("MAGIC", Object.keys(User.prototype)); // product.addCarts, product.getCarts, etc

    // For now create a dummy user if not found
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: "Sam", email: "sam@test.com" }); // Returns a promise
    }
    return Promise.resolve(user); // We want to be consistent to return a promise.  Technically you can remove Promise.resolve() because it automatically returns a promise when you return from a then block
    // return user // returning a value in a .then block it is automatically wrapped in a promise and therefore we can chain a .then() thereafter
  })
  .then(user => {
    // User/Cart (1:1) associations
    // Note this is creating a new record in Carts table everytime the server is restarted.
    // A cart just needs to be there when the site is loaded.
    return user.createCart(); // (important - In the beginning a user cart will not hold any special data.  When we load the Cart page, then we load the products associated to that cart.
  })
  .then(cart => {
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
