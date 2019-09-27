const Product = require("../models/product");

// Link to add product page
exports.getAddProduct = (req, res, next) => {
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product" // Note property path value is arbitrary and will be used in our template to control UI features

    // Below allow us to add css files and control class behavior in main-layout.hbs
    // formsCSS: true,
    // productCSS: true,
    // activeAddProduct: true
  });
};

// Add new product
exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.redirect("/");
};

// Render page with all products
exports.getProducts = (req, res, next) => {
  Product.fecthAll(products => {
    res.render("shop", {
      prods: products, // Inject as an object with a key name that we can refer to in the template.
      pageTitle: "Shop",
      path: "/"
      // hasProducts: products.length > 0, // For handlebars that only handles true/false.  Conditional stmts not allowed with handlebars.
      // activeShop: true,
      // productCSS: true
    });
  });
};
