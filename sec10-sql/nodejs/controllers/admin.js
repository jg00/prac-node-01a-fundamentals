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
    editing: false,
    product: "" // Fix for when clicking on Add Product
  });
};

// "Add Product" button within "Add Product" page form
exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  const product = new Product(null, title, imageUrl, description, price);
  product.save();
  res.redirect("/"); // This may need to go to "Admin Products" page
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

/*
  "Update" button with the "admin/edit-product" page
  1 Fetch information for the product
  2 Create new product instance and populate with the fetched information
  3 Call save
*/
exports.postEditProduct = (req, res, next) => {
  // console.log("check", req.body);

  const {
    productId,
    title: updatedTitle,
    imageUrl: updatedImageUrl,
    description: updatedDescription,
    price: updatedPrice
  } = req.body;

  const updatedProduct = new Product(
    productId,
    updatedTitle,
    updatedImageUrl,
    updatedDescription,
    updatedPrice
  );

  updatedProduct.save(); // Important - It is best to have a callback so that we only redirect after saving is done.  Will return to this.
  res.redirect("/admin/products");
};

// Navigation link "Admin Products"
exports.getProducts = (req, res, next) => {
  /* I jumped ahead - will return to this and use original version below for now
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("admin/products", {
        prods: rows,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      console.log(err);
    });
  */

  // Ref only for file data source
  Product.fetchAll(products => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products"
    });
  });
};

// "Delete" button within "Admin Products" page
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.deleteById(prodId); // Important - It is best to have a callback so that we only redirect after deleting the product is done.  Will return to this.
  res.redirect("/admin/products");
};
