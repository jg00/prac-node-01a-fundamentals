const Product = require("../models/product");

// add/edit product forms are the same
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  // Product id set as null to save a new product
  const product = new Product(null, title, imageUrl, price, description);
  product.save();
  res.redirect("/"); // maybe will be redirected to Admin Products instead of Shop
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  console.log(req.body);
  res.json("test");
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products"
    });
  });
};
