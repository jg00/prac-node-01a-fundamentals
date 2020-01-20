const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit"); // expoes constructor

const Product = require("../models/product");
// const Cart = require("../models/cart");
const Order = require("../models/order");

// Navigation link "Products"
exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      // console.log("getProducts", products); // [{},{}..]

      res.render("shop/product-list", {
        prods: products, // Inject as an object with a key name that we can refer to in the template.
        pageTitle: "All Products",
        path: "/products"
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

// "Details" button in "Products" page
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId) // Mongoose can also be passed a string id and mongoose will conveniently change to a mongodb objectId.
    .then(product => {
      // console.log("getProduct", product); // .findByPk() returns an object {dataValues: {id:1, title:'A Book', ..}}

      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products"
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      // console.log(err)
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

// Navigation link "Shop"
exports.getIndex = (req, res, next) => {
  // Sequelize model
  Product.find()
    .then(products => {
      // console.log(".getIndex", products); // [{},{}..]
      // console.log("CHECK2", req.session.user);
      // console.log("CHECK2", req.session.isLoggedIn);

      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
        // isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken() // generates a token which we can then use in our view.
      });
    })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

// Navigation link "Cart"
exports.getCart = (req, res, next) => {
  // req.session.user // MongoDBStore session user
  // console.log("HERE", req.user);

  req.user // Mongoose user
    .populate("cart.items.productId") // .populates does not return a promise
    .execPopulate() // This is how we can get a promise from .populate()
    .then(user => {
      // console.log("HERE2", user.cart.items);
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      // console.log(erro)
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

/*
  1 Fetch product
  2 Add the product object to cart

  Important - req.user is our user {} object instance set in app.js.  This means we have access to our User object methods and properties.
*/
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId; // Note this is a string

  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product); // on instance of the current user we save it's cart
    })
    .then(result => {
      // console.log("postCart", result);
      res.redirect("/cart");
    })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

// "Delete" button from "Cart" page
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeFromCart(prodId)

    .then(result => {
      // console.log("Item removed from the cart!");
      res.redirect("/cart");
    })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

// Post order
exports.postOrders = (req, res, next) => {
  req.user
    .populate("cart.items.productId") // .populates does not return a promise
    .execPopulate() // This is how we can get a promise from .populate()
    .then(user => {
      // console.log("HERE", user.cart.items);
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }; // mongoose field _doc but looks like it still works without the _doc.
      });

      const order = new Order({
        user: {
          // name: req.user.name,
          email: req.user.email,
          userId: req.user
        },
        products: products
      });

      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => {
      // console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

/*
  imageUrl:
  'https://cdn.pixabay.com/photo/2016/03/31/20/51/book-1296045_960_720.png',

*/

// Navigation link "Orders"
exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })

    .then(orders => {
      // console.log("HERE", orders);
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500; // You can pass extra information with the error object.
      return next(err);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error("No order found!"));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument(); // Also a readable stream.

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.text("Hello world!");

      pdfDoc.end(); // Calling .end() causes writable streams and the reponse ended and therefore the file will be saved and the file sent.

      /* 1 Reference only - Reads entire file to memory first before serving as response
      fs.readFile(invoicePath, (err, data) => {
        if (err) {
          return next(err);
        }

        res.setHeader("Content-Type", "application/pdf");
        // res.set("Content-Disposition", "inline");
        // res.setHeader("Content-Disposition", "inline");
        res.setHeader(
          "Content-Disposition",
          'inline; filename="' + invoiceName + '"'
        );
        res.send(data);
      });
      */

      /* 2 Reference only - Sample file stream
      const file = fs.createReadStream(invoicePath);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );

      file.pipe(res);
      */
    })
    .catch(err => next(err));
};

// "Checkout" button within "Cart" page
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout"
    // isAuthenticated: req.session.isLoggedIn
  });
};
