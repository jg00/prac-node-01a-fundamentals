// const mongodb = require("mongodb");
const mongoose = require("mongoose"); // Only used to test and create _id: mongoose.Types.ObjectId("5e059eca2f4fd90d48d9f4b7")

const Product = require("../models/product");
const { validationResult } = require("express-validator");

// Navigation link is still "Add Product" but now renders "edit-product.ejs"
exports.getAddProduct = (req, res, next) => {
  // Will use middleware to check instead
  // if (!req.session.isLoggedIn) {
  //   return res.redirect("/login"); // to get a session
  // }

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product", // Note property path value is arbitrary and will be used in our template to control UI features
    editing: false,
    hasError: false, // additional check to display form input values
    product: "", // Fix for when clicking on Add Product
    // isAuthenticated: req.session.isLoggedIn
    errorMessage: null, // Display error feedback
    validationErrors: [] // full [] array of errors
  });
};

// "Add Product" button within "Add Product" page form
exports.postAddProduct = (req, res, next) => {
  // const { title, imageUrl, price, description } = req.body; // before receiving only urlencoded content type

  const { title, price, description } = req.body;
  const image = req.file; // returns file object

  // console.log("HERE", image);

  // Invalid file input
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true, // Additional check to display form input values
      errorMessage: "Attached file is not an image.", // Display error feedback
      product: {
        title: title,
        // imageUrl: imageUrl, // no longer text
        price: price,
        description: description
      },
      validationErrors: [] // full [] array of errors
    });
  }

  // Form validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true, // Additional check to display form input values
      errorMessage: errors.array()[0].msg, // Display error feedback
      product: {
        title: title,
        // imageUrl: imageUrl,
        price: price,
        description: description
      },
      validationErrors: errors.array() // full [] array of errors
    });
  }

  // Form inputs have been validated
  const imageUrl = image.path; // path: 'images/2020-01-15T14:42:36.848Z-boat.png'; Path to use for fetching that image.

  // Now we a Product model managed by Mongoose. Mongoose models comes with functions we can use.
  const product = new Product({
    // _id: new mongoose.Types.ObjectId("5e059eca2f4fd90d48d9f4b7"), // For testing only to cause database technical error by trying to create a new product with existing id.  This causes .catch() below to fire.
    title,
    price,
    description,
    imageUrl,
    userId: req.user // Conveniently you can just store entire object and mongoose will use the user._id
    // userId: req.user._id
  });

  product
    .save() // Mongoose will provide this save() method.  Technically we don't get a promise but Mongoose provide it for us
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products"); // This may need to go to "Admin Products" page
    })
    .catch(err => {
      // console.log("Test scenario: An error occurred");
      // console.log(err);

      /*
        // One way we could handle error may be to rerender same page and show user.  Status 500 indicates server side error occurred.
        return res.status(500).render("admin/edit-product", {
          pageTitle: "Add Product",
          path: "/admin/add-product",
          editing: false,
          hasError: true, // Additional check to display form input values
          errorMessage: "Database operation failed, please try again.", // Display error feedback
          // Way to keep user input
          product: {
            title: title,
            imageUrl: imageUrl,
            price: price,
            description: description
          },
          validationErrors: [] // full [] array of errors.  Empty [] if we do not want to place a red border around input elements.
        });
      */

      // Another way to handle bigger issues and instead display an error page instead of showing same page again.
      // We would then have to place this line of code below everywhere.
      // res.redirect("/500");

      // Third approach is instead of redirecting we can "throw new Error()" which may be better so as to not duplicate res.redirect("/500") everywhere
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
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
      // throw new Error("Dummy error to fire .catch()"); // Test only

      if (!product) {
        return res.redirect("/");
      }

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product", // Here we do not want any navigation link highlighted.
        editing: editMode,
        hasError: false, // additional check to display form input values
        errorMessage: null, // Display error feedback
        product: product,
        validationErrors: [] // full [] array of errors
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
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
    // imageUrl: updatedImageUrl,
    description: updatedDescription,
    price: updatedPrice
  } = req.body;

  const image = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Editing errors:", errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true, // Additional check to display form input values
      errorMessage: errors.array()[0].msg, // Display error feedback
      product: {
        title: updatedTitle,
        // imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDescription,
        _id: prodId
      },
      validationErrors: errors.array() // full [] array of errors
    });
  }

  /*
    With mongoose instead of creating a new product:
    1a We can fetch a product 'from the database'. Note here we have 
      a full mongoose object returned with methods like save().
    1b We update that mongoose product object returned
    2 then call save() on that product
  */

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;

      // Only update if a new image was selected else keep what is currently in the database for the imageUrl.
      if (image) {
        product.imageUrl = image.path;
      }

      return product
        .save() // Purpose of the return here will send the data to the next .then else it print out undefined.
        .then(result => {
          // console.log("UPDATED PRODUCT!", result); // A promise 'resolve'
          res.redirect("/admin/products");
        });
    })
    // Commented out because the first return res.redirect('/') will still execute the next .then block
    // .then(result => {
    //   // console.log("UPDATED PRODUCT!", result); // A promise 'resolve'
    //   res.redirect("/admin/products");
    // })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });

  /* MongoDb version
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
  */
};

// // Navigation link "Admin Products"
exports.getProducts = (req, res, next) => {
  // Product.find().cursor().next() <- .find() for mongoose does not return a cursor however you could still get it
  // Product.find().cursor().eachAsync()  <- allow you to loop through the cursor

  // console.log("HERE", req.user);

  // Note the .select() and .populate() for data fetching with mongoose.
  // Product.find()
  Product.find({ userId: req.user._id })
    // .select("title price -_id") // You can specify fields to return and exclude
    // .populate("userId", "name") // Allows you to get the whole user object and not just the userId associated to the product

    .populate("userId") // Allows you to get the whole user object and not just the userId associated to the product
    .then(products => {
      // console.log("HERE", products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

// "Delete" button within "Admin Products" page
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // console.log("DELETE THIS", prodId);

  // Product.findByIdAndRemove(prodId)
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch(err => {
      // console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    }); // Catches any errors for 1st or 2nd promise returned
};
