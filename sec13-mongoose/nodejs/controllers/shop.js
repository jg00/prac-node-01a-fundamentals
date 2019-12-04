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
      });
    })
    .catch(err => console.log(err));
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
      });
    })
    .catch(err => console.log(err));
};

// Navigation link "Shop"
exports.getIndex = (req, res, next) => {
  // Sequelize model
  Product.find()
    .then(products => {
      // console.log(".getIndex", products); // [{},{}..]

      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/"
      });
    })
    .catch(err => console.log(err));
};

// Navigation link "Cart"
exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId") // .populates does not return a promise
    .execPopulate() // This is how we can get a promise from .populate()
    .then(user => {
      // console.log("HERE", user.cart.items);
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products
      });
    })
    .catch(err => console.log);
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
      console.log("postCart", result);
      res.redirect("/cart");
    })
    .catch(err => {
      console.log(err);
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
      console.log(err);
    });
};

// Post order
exports.postOrders = (req, res, next) => {
  req.user
    .populate("cart.items.productId") // .populates does not return a promise
    .execPopulate() // This is how we can get a promise from .populate()
    .then(user => {
      console.log("HERE", user.cart.items);
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } }; // mongoose field _doc but looks like it still works without the _doc.
      });

      const order = new Order({
        user: {
          name: req.user.name,
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
      console.log(err);
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
      console.log("HERE", orders);
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

// "Checkout" button within "Cart" page
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout"
  });
};
