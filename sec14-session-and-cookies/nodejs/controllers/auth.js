// Navigation link "Login"
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: req.isLoggedIn
  });
};

// Login button on Login page
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  // req.isLoggedIn = true;  // Instead of seeting property on the request, we can send a cookie (via response header) back along with the response.
  // res.cookie("isLoggedInCookie", true); // Note this looks like it works as well.

  res.setHeader("Set-Cookie", "loggedIn=true");
  res.redirect("/"); // Important this ends the request cycle and starts a new request.  Therefore the req.isLoggedIn property is no longer available on our new request.
};
