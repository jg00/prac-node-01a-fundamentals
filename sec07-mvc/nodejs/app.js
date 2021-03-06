// const http = require("http");
const path = require("path");

const errorController = require("./controllers/error");

const express = require("express");
const app = express();

// app.set() is used to set a global configuration value on our express application.  We can use app.get() to get that value for the property.
// We can provide 'reserved' keywords to set like 'view engine', 'views', etc.

// Set up for express-handlebars - unlike pug and ejs, we need to register handlebars engine.
/*
  const expressHbs = require("express-handlebars");
  
  app.engine(
    "hbs", // Give the engine any name (ie 'handlebars' is what we used), and call the function  below to initialze.
    expressHbs({
      layoutsDir: "views/layouts",
      defaultLayout: "main-layout",
      extname: "hbs" // Applied to default layout out only.  Now this is configured to look for a default layout called main-layout.hbs and not main-layout.handlebars
    }) // This is specific to configure 'layout' with handlebars
  );
  app.set("view engine", "hbs");
  app.set("views", "views");
*/

// Set up for pug
// app.set("view engine", "pug"); // pug is supported out of the box.  No need to require pug.
// app.set("views", "views");

// Set up for ejs.  Ejs is also supported out of the box.
app.set("view engine", "ejs");
app.set("views", "views");

// const adminData = require("./routes/admin");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Express forwards any requests for images, .css, .js, etc. to look in this folder.

// app.use("/admin", adminData.routes);
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// Check only
/*
  app.use((req, res, next) => {
    console.log(req.url);
    next();
  });
*/

// 204: No Content
app.use("/favicon.ico", errorController.get204);

// 404: Page Not Found
app.use(errorController.get404);

app.listen(3000);

// Works as well
// const server = http.createServer(app);
// server.listen(3000);
