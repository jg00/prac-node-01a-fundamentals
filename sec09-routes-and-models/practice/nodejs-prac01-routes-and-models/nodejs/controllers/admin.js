const Product = require("../models/product");

/* Replaced with Edit Product
// Navigation link "Add Product"
exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product" // Note property path value is arbitrary and will be used in our template to control UI features
  });
};
*/

// Navigation link is still "Add Product" but now renders "edit-product.ejs"
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product", // Note property path value is arbitrary and will be used in our template to control UI features
    editing: false
  });
};

// "Add Product" button within "Add Product" page form
exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  const product = new Product(title, imageUrl, description, price);
  product.save();
  res.redirect("/");
};

// "Edit" button within "Admin Products" page - passed in .productId as params and .edit via query params
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // Extracted value is always a string like "true"
  if (!editMode) {
    res.redirect("/"); // For now just redirect
  }

  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product", // Here we do not want any navigation link highlighted.
      editing: editMode,
      product: product
    });
  });
};

// CONTINUE HERE
exports.postEditProduct = (req, res, next) => {
  console.log("check", req.body);

  res.redirect("/");
};

// Navigation link "Admin Products"
exports.getProducts = (req, res, next) => {
  Product.fecthAll(products => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products"
    });
  });
};
