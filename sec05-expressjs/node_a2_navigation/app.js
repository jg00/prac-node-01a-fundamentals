const express = require("express");
const app = express();

const userRoutes = require("./routes/user");
const mainRoutes = require("./routes/main");

app.use("/users", userRoutes);
app.use(mainRoutes);

app.use("/favicon.ico", (req, res, next) => res.status(204).end());

app.use((req, res, next) => {
  res.status(404).send("<h1>File Not Found</h1>");
});

app.listen(3000, () => console.log("Server started!"));
