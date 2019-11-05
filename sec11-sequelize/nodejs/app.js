const path = require("path");

const express = require("express");
const app = express();

const errorController = require("./controllers/error");

const sequelize = require("./util/database");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

// 204: No Content
app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
});

app.use(errorController.get404);

/* 
  sync() function 
  - is aware of all our models
  - creates any tables that do not exists (sequelize creates the sql query for these in the backgrund)
      CREATE TABLE IF NOT EXISTS `products` (id....)
  - table names are pluralized ex: 'product' becomes 'products'
*/
sequelize
  .sync()
  .then(result => {
    // console.log(result);
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
