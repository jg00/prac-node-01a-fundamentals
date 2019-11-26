// const mongodb = require("mongodb");
const Product = require("../models/product");

// const ObjectId = mongodb.ObjectId; // MongoDb's ObjectId's constructor function; Better to convert the product id type on the product model directly.

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

  const product = new Product(
    title,
    price,
    description,
    imageUrl,
    null, // Do not pass id value to create a new product instance.
    req.user._id // Purpose is for us to just know who is currently connected and who is adding the product.
  );

  product
    .save()
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products"); // This may need to go to "Admin Products" page
    })
    .catch(err => console.log(err));
};

/*
  Note on "req.user._id"
    - Here don't need to "embedded" a user document when creating a product.  That is because if the 
    user data changes you would have to change it in all product documents unless, it is 
    user info that does not change like the associated username.
    - Here we just "reference" the user id to the product document so that we know who is connected
    eventhough we are not using it a lot. This is us creating a relation using a "reference".
*/

// "Edit" button within "Admin Products" page - passed in .productId as params and .edit via query params
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // Extracted value is always a string like "true"
  if (!editMode) {
    res.redirect("/"); // For now just redirect
  }

  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect("/");
      }

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product", // Here we do not want any navigation link highlighted.
        editing: editMode,
        product: product
      });
    })
    .catch(err => {
      console.log(err);
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

  // New values from our edit product form.  Note when destructuring - const { source: customName } = req.body
  const {
    productId: prodId,
    title: updatedTitle,
    imageUrl: updatedImageUrl,
    description: updatedDescription,
    price: updatedPrice
  } = req.body;

  // New product {} object based on our edited values but we specify the id of the product we are updating.
  const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedDescription,
    updatedImageUrl,
    prodId // Here we simply passed the string but converted in the product model.  For MongoDB we need to simply wrap our id of type string as a MongoDb object id so it can be used by Mongdb when searching through documents.
    // new ObjectId(prodId) // Done on the model instead. For MongoDB we need to simply wrap our id of type string as a MongoDb object id so it can be used by Mongdb when searching through documents.
  );

  product
    .save()
    .then(saveResult => {
      console.log("UPDATED PRODUCT!", saveResult); // A promise 'resolve'
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

// // Navigation link "Admin Products"
exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// "Delete" button within "Admin Products" page
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product.deleteById(prodId)
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err)); // Catches any errors for 1st or 2nd promise returned
};
