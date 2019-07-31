// const http = require("http");
const path = require("path");

const express = require("express");
const app = express();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: false }));

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
app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
  // res.status(204).send("No Content");
  // res.sendStatus(204);
});

app.use((req, res, next) => {
  // res.status(404).send("<h1>Page not found</h1>");
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000);

// Works as well
// const server = http.createServer(app);
// server.listen(3000);
