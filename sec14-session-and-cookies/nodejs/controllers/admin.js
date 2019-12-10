// const mongodb = require("mongodb");
const Product = require("../models/product");

// Navigation link is still "Add Product" but now renders "edit-product.ejs"
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product", // Note property path value is arbitrary and will be used in our template to control UI features
    editing: false,
    product: "", // Fix for when clicking on Add Product
    isAuthenticated: req.session.isLoggedIn
  });
};

// "Add Product" button within "Add Product" page form
exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  // Now we a Product model managed by Mongoose. Mongoose models comes with functions we can use.
  const product = new Product({
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
        product: product,
        isAuthenticated: req.session.isLoggedIn
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

  /*
    With mongoose instead of creating a new product:
    1a We can fetch a product 'from the database'. Note here we have 
      a full mongoose object returned with methods like save().
    1b We update that mongoose product object returned
    2 then call save() on that product
  */

  Product.findById(prodId)
    .then(product => {
      (product.title = updatedTitle),
        (product.price = updatedPrice),
        (product.description = updatedDescription),
        (product.imageUrl = updatedImageUrl);

      return product.save();
    })
    .then(result => {
      // console.log("UPDATED PRODUCT!", result); // A promise 'resolve'
      res.redirect("/admin/products");
    })
    .catch(err => {
      console.log(err);
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

  // Note the .select() and .populate() for data fetching with mongoose.
  Product.find()

    // .select("title price -_id") // You can specify fields to return and exclude
    // .populate("userId", "name") // Allows you to get the whole user object and not just the userId associated to the product

    .populate("userId") // Allows you to get the whole user object and not just the userId associated to the product
    .then(products => {
      // console.log("HERE", products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// "Delete" button within "Admin Products" page
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // console.log("DELETE THIS", prodId);

  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err)); // Catches any errors for 1st or 2nd promise returned
};
