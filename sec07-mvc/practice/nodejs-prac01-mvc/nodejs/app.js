const path = require("path");

const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

// const adminRoutes = require("./routes/admin");
const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// app.use("/admin", adminRoutes);
app.use("/admin", adminData.routes);
app.use(shopRoutes);

// 204: No Content
app.use("/favicon.ico", (req, res, next) => {
  res.status(204).end();
});

app.use((req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page Not Found", path: "/" });
});

app.listen(3000);
