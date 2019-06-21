const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const db = require("./util/database");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

/*
    db.execute()
    db.query() - execute() may be safer option
    db.end() - end() when our application is to shut down
*/

/* Test code only */
/* db.execute("SELECT * FROM products")
  .then(([rows, fieldData]) => {
    // console.log(result[0], result[1]);
    // console.log(result[0][0]);
    // console.log(result);
    console.log(rows)
    console.log(fieldData);
  })
  .catch(err => {
    console.log(err);
  }); */

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
