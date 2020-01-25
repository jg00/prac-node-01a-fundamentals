const express = require("express");
const app = express();

const feedRoutes = require("./routes/feed");

app.use(express.urlencoded({ extended: false }));

app.use("/feed", feedRoutes);

app.listen(8080, () => console.log("test"));
