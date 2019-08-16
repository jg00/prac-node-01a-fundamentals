const Product = require("../models/product"); // Import Product class.

// const products = []; // No longer needed.  Moved to model/products.js.

// Reference from controllers/products.js
exports.getAddProduct = (req, res, next) => {
  // console.log("In the add product middleware!");
  // res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"><input type="text" name="author"><button type="submit">Add Product</button></form>');

  // console.log("/add-product rootDir:", rootDir);
  // res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
  // res.sendFile(path.join(rootDir, "views", "add-product.html"));

  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product", // Note property path value is arbitrary and will be used in our template to control UI features

    // Below allow us to add css files and control class behavior in main-layout.hbs
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

// Reference from controllers/products.js
exports.postAddProduct = (req, res, next) => {
  //   console.log("In the post /add-product");
  // console.log(req.body);
  // products.push({ title: req.body.title }); // Pushing a new {} with title property but could have also pushed the req.body {} directly.

  const product = new Product(req.body.title);
  product.save(); // You now have access to 'this' when .save() is called.
  res.redirect("/");
};

exports.getProducts = (req, res, next) => {
  // console.log(path.join(__dirname, "../", "views", "shop.html"));
  // res.sendFile(path.join(__dirname, "../", "views", "shop.html"));
  // res.sendFile(path.join(rootDir, "views", "shop.html"));

  // adminData.products no longer needed.
  // console.log("shop.js", adminData.products); // Note - This is possible to share data within our Node server scope.  Therefore shared across 'all' users.
  // const products = adminData.products; // [ {title: 'a'}, {title: 'b'}]

  // Product.fetchAll(callback function)
  // Main idea here is we render the view only after all the fetching
  // of the products data is done.
  // Now the overall function .fetchAll will not return anything.
  Product.fetchAll(products => {
    res.render("shop", {
      prods: products, // Inject as an object with a key name that we can refer to in the template.
      pageTitle: "Shop",
      path: "/",
      hasProducts: products.length > 0, // For handlebars that only handles true/false.  Conditional stmts not allowed with handlebars.
      activeShop: true,
      productCSS: true
      // layout: false // Special handlebars 'layout' key to disable default behavior of handlebars to use template.
    });
  });
};

/*
Issue will be .fetchAll() is expecting an array of products.
However, the .fetchAll() is executing an async code to retrieve data from a file.
Need to handle async code accordingly.
*/
exports.getProducts = (req, res, next) => {
  const products = Product.fetchAll();
  res.render("shop", {
    prods: products, // Inject as an object with a key name that we can refer to in the template.
    pageTitle: "Shop",
    path: "/",
    hasProducts: products.length > 0, // For handlebars that only handles true/false.  Conditional stmts not allowed with handlebars.
    activeShop: true,
    productCSS: true
    // layout: false // Special handlebars 'layout' key to disable default behavior of handlebars to use template.
  });
};
