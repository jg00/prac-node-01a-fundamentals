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

// This version is for after we created the table relation via Sequelize (Product <-- Has many -- User)
// "Add Product" button within "Add Product" page form
// Remember that req.user.id is a Sequelize user {} object which holds both database "data for the user" and "Sequelize helper methods".
// In this case because we made the table relation via Sequelize we can use ....

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  /* Important notes for when Sequlize associations are created
    A more elegant way using Sequelize automatically added method(s) to our user objedt when we create table associations through Sequelize.
    -> If you set up associations, Sequelize adds special methods depending on the associations
    -> For a .belongsTo() and/or .hasMany() association, Sequelize
    adds methods that allow us for example to create a new associated object.
    -> So since a user has many products 'or' product belongs to a user relation defined,
    Sequelize automatically adds a .createProduct() method to our user object.
    -> req.user.createProduct() may be read as "user has many products" ie there is a userId foreign key in products table
    -> Pass to it the data {fields that can't be infered by sequelize ie anything but the userid and timestamps }
  */

  // Sequelize model - after User/Product association created we get other methods.
  req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description
      // userId: req.user.id // Sequelize can infer this FK from req.user object
    })
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products"); // This may need to go to "Admin Products" page
    })
    .catch(err => console.log(err));

  /*
    // Sequelize model - create instance and save in one step. Before User/Prouduct association created.
    Product.create({
      title: title,
      price: price,
      imageUrl: imageUrl,
      description: description,
      userId: req.user.id // One approach - we could add userId like this but we can use the Sequelize "table relational methods" instead
    })
      .then(result => {
        console.log("Created Product");
        res.redirect("/admin/products"); // This may need to go to "Admin Products" page
      })
      .catch(err => console.log(err));
  */
};

/* 
// Ref for before we made a relation via Sequelize (Product <-- Has many -- User)
// "Add Product" button within "Add Product" page form
exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;

  // Sequelize model - create instance and save in one step
  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  })
    .then(result => {
      console.log("Created Product");
      res.redirect("/admin/products"); // This may need to go to "Admin Products" page
    })
    .catch(err => console.log(err));
};
 */

/*
  Create a new Product by calling one of the methods provided by sequelize
  .build() - Builds a new model instance only in JavaScrtipt and then we need to save it manually.
  .create() - Builds a new model instance and calls save on it.
  
  Executes:
  INSERT INTO `products` (`id`,`title`,`price`,`imageUrl`,`description`,`createdAt`,`updatedAt`) VALUES (DEFAULT,?,?,?,?,?,?);
*/

/* 
  // Ref for how we created a new instance of Product previously
  // "Add Product" button within "Add Product" page form
  exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, price, description } = req.body;

    const product = new Product(null, title, imageUrl, description, price);
    product
      .save()
      .then(result => {
        // Don't really need the result but we want to redirect once the insert is successful
        res.redirect("/"); // This may need to go to "Admin Products" page
      })
      .catch(err => console.log(Error));
  };
 */

// "Edit" button within "Admin Products" page - passed in .productId as params and .edit via query params
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // Extracted value is always a string like "true"
  if (!editMode) {
    res.redirect("/"); // For now just redirect
  }

  // Sequelize model - after User/Product association created we get other methods.
  const prodId = req.params.productId;

  // Lets say we only want to find products for the currently logged in user
  // Here we get products on a user and the sql statement will be select .. where product.userId=1 and product.id=2
  req.user
    .getProducts({ where: { id: prodId } }) // returns []
    // Product.findByPk(prodId)
    .then(products => {
      // console.log("HERE", product);

      const product = products[0]; // since [] of products returned

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

  /* 
  // Sequelize model - before association
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
  */

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
  // Sequelize model - after User/Product association created we get other methods.
  // Let's say we only want to return products associated tot he logged in user

  req.user
    .getProducts()
    // Product.findAll()
    .then(products => {
      // console.log(products); // [{},{}..]

      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch(err => console.log(err));

  /* 
    // Sequelize model - before association
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
  */

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
