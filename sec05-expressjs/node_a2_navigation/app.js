const path = require("path");
const express = require("express");
const app = express();

const userRoutes = require("./routes/user");
const mainRoutes = require("./routes/main");

app.use(express.static(path.join(__dirname, "public")));

app.use("/users", userRoutes);
app.use(mainRoutes);

app.use("/favicon.ico", (req, res, next) => res.status(204).end());

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000, () => console.log("Server started!"));
