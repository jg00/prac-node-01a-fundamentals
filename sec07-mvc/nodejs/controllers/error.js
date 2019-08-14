// Ref app.js. 404 Page Not Found
exports.get404 = (req, res, next) => {
  // res.status(404).send("<h1>Page not found</h1>");
  // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.status(404).render("404", { pageTitle: "Page Not Found", path: "/" });
};

// Ref app.js. 204 No Content
exports.get204 = (req, res, next) => {
  res.status(204).end();
  // res.status(204).send("No Content");
  // res.sendStatus(204);
};
