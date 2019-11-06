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

  // Sequelize model - create instance and save in one step
  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description
  })
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products"); // This may need to go to "Admin Products" page
    })
    .catch(err => console.log(err));
};

/*
  Create a new Product by calling one of the methods provided by sequelize
  .build() - Builds a new model instance only in JavaScrtipt and then we need to save it manually.
  .create() - Builds a new model instance and calls save on it.
  
  Executes:
  INSERT INTO `products` (`id`,`title`,`price`,`imageUrl`,`description`,`createdAt`,`updatedAt`) VALUES (DEFAULT,?,?,?,?,?,?);
*/

// Ref for how we created a new instance of Product previously
// // "Add Product" button within "Add Product" page form
// exports.postAddProduct = (req, res, next) => {
//   const { title, imageUrl, price, description } = req.body;

//   const product = new Product(null, title, imageUrl, description, price);
//   product
//     .save()
//     .then(result => {
//       // Don't really need the result but we want to redirect once the insert is successful
//       res.redirect("/"); // This may need to go to "Admin Products" page
//     })
//     .catch(err => console.log(Error));
// };

// "Edit" button within "Admin Products" page - passed in .productId as params and .edit via query params
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // Extracted value is always a string like "true"
  if (!editMode) {
    res.redirect("/"); // For now just redirect
  }

  // Sequelize model
  const prodId = req.params.productId;
  Product.findByPk(prodId)
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
    .catch(err => console.log(err));

  /* 'mysql2' file data source
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
  */
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

  Product.findByPk(prodId) // 1st promise
    .then(product => {
      // console.log(product); // returns our product {}
      // Note - here we can now work with all the attributes our product has.
      // This does not directly change our data in the database.  It will only do it locally for the moment.

      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;

      // instance object .save() method provided by Sequelize
      // If product does not exists yet, it will create a new one.
      // But if it does, it will update the existing product in the database.
      // We could nest our promises like product.save().then().catch(),
      // but better to return the promise.

      return product.save(); // 2nd promise
    })
    .then(saveResult => {
      console.log("UPDATED PRODUCT!", saveResult); // A promise 'resolve'
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err)); // For error associated to "both" promises - .findByPk() promise and .save() promise

  /* 
  'mysql2' package - we create instance and then call save() static function in the Product class.
  const updatedProduct = new Product(
    productId,
    updatedTitle,
    updatedImageUrl,
    updatedDescription,
    updatedPrice
  );

  updatedProduct.save(); // Important - It is best to have a callback so that we only redirect after saving is done.  Will return to this.
  res.redirect("/admin/products"); 
*/
};

// Navigation link "Admin Products"
exports.getProducts = (req, res, next) => {
  // Sequelize model  - I jumped ahead - Will keep sequelized version for now
  Product.findAll()
    .then(products => {
      // console.log(products); // [{},{}..]

      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => console.log(err));

  /* 'mysql2' package - I jumped ahead - will return to this and use original version below for now
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

  /*
    // Ref only for file data source
    Product.fetchAll(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    });
  */
};

// "Delete" button within "Admin Products" page
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  // Sequelize - 1st approach - Find product and then use the "instance" .destroy() method
  Product.findByPk(prodId) // 1st promise
    .then(product => {
      return product.destroy(); // 2nd promise. Again better to return the promise and handle in the .then() thereafter
    })
    .then(result => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err)); // Catches any errors for 1st or 2nd promise returned

  /* 
    // Sequelize - 2nd approach - Using Model class .destroy() method
    Product.destroy({where:{ id: prodId}})
      .then(result => {
        console.log("PRODUCT DELETED!");
        res.redirect("/admin/products");
      })
      .catch(err => console.log(err));
  */

  /* File data source
    Product.deleteById(prodId); // Important - It is best to have a callback so that we only redirect after deleting the product is done.  Will return to this.
    res.redirect("/admin/products");
   */
};
