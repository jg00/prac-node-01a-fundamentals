const Product = require("../models/product");
const Cart = require("../models/cart");

// Navigation link "Products"
exports.getProducts = (req, res, next) => {
  Product.fecthAll(products => {
    res.render("shop/product-list", {
      prods: products, // Inject as an object with a key name that we can refer to in the template.
      pageTitle: "All Products",
      path: "/products"
    });
  });
};

// "Details" button in "Products" page
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
    res.render("shop/product-detail", {
      product: product,
      pageTitle: product.title,
      path: "/products"
    });
  });
};

// Navigation link "Shop"
exports.getIndex = (req, res, next) => {
  Product.fecthAll(products => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/"
    });
  });
};

// Navigation link "Cart"
exports.getCart = (req, res, next) => {
  res.render("shop/cart", { pageTitle: "Your Cart", path: "/cart" });
};

// "Add to Cart" button in "Product Detail" page
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });

  res.redirect("/cart");
};

// Navigation link "Orders"
exports.getOrders = (req, res, next) => {
  res.render("shop/orders", { pageTitle: "Your Orders", path: "/orders" });
};

// "Checkout" button within "Cart" page
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout"
  });
};
