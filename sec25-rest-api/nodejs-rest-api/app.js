const express = require("express");
const app = express();

const feedRoutes = require("./routes/feed");

app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // application/json

// Deal with CORS issue
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"), // '*' allow all domains that should be alble to access our server or specific client like 'codepen.io'.
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE"
    ), // We tell the clients (ie the Origins) that they are only allowed to use specific http methods.
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    ); // '*' or specific headers our clients are allowed to set on their requests.

  next();
});

app.use("/feed", feedRoutes);

app.listen(8080, () => console.log("Server started"));
