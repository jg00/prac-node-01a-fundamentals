const path = require("path");

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const MONGODB_URI = `mongodb://bart:0BPmJVZdUUrIftYg@cluster0-shard-00-00-f9pzz.mongodb.net:27017,cluster0-shard-00-01-f9pzz.mongodb.net:27017,cluster0-shard-00-02-f9pzz.mongodb.net:27017/messages?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority`;

app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // application/json

app.use("/images", express.static(path.join(__dirname, "images")));

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

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message; // This property exists by default and holds the message passed to the Error constructor
  res.status(status).json({ message: message });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    app.listen(8080, () => console.log("Server started"));
  })
  .catch(err => console.log(err));
