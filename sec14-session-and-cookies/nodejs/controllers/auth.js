// Navigation link "Login"
exports.getLogin = (req, res, next) => {
  // Extract cookie -> isLoggedIn=true
  // const isLoggedIn =
  //   req
  //     .get("Cookie")
  //     .split(";")[0]
  //     .trim()
  //     .split("=")[1] === "true";

  // console.log(req.get("Accept-Language"));

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    // isAuthenticated: isLoggedIn
    isAuthenticated: req.isLoggedIn
  });
};

// Login button on Login page
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  // req.isLoggedIn = true;  // Instead of seeting property on the request, we can send a cookie (via response header) back along with the response.
  // res.cookie("isLoggedInCookie", true); // Note this looks like it works as well.

  // res.setHeader("Set-Cookie", "loggedIn=true"); // Name of the header is 'Set-Cookie' and that is a reserved name. Second parameter is a key-value pair.
  // res.setHeader("Set-Cookie", "loggedIn=true; Max-Age=10");
  // res.setHeader("Set-Cookie", "loggedIn=true; Max-Age=10; Secure");
  // res.setHeader("Set-Cookie", "loggedIn=true; Max-Age=10"; Domain="");
  res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly");
  res.redirect("/"); // Important this ends the request cycle and starts a new request.  Therefore the req.isLoggedIn property is no longer available on our new request.
};
