const path = require("path");

const express = require("express");
const app = express();

const mongoConnect = require("./util/database").mongoConnect;

const errorController = require("./controllers/error");

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
// const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  /* 
  User.findByPk(1)
    .then(user => {
          req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
*/

  next(); // quick fix for now
});

// Commented out temporarily
app.use("/admin", adminRoutes);
// app.use(shopRoutes);

// 204: No Content
app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
});

app.use(errorController.get404);

// New approach
mongoConnect(() => {
  app.listen(3000, () => console.log("Server Started"));
});

/* Ref only - First approach where we got the client connection to the database.
  1 Connect to our database and get access to our client{] object to access our database
  2 and then start our server 

  mongoConnect(client => {
    console.log(client);
    app.listen(3000);
  });
*/
