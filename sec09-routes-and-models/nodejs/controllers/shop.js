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
  Cart.getCart(cart => {
    // Remeber the cart only has the product id's, qty, and cart total.  However we also need produduct detail info.
    Product.fecthAll(products => {
      const cartProducts = [];
      // Now that we have all the products we need to filter for products that are actually in the cart
      for (product of products) {
        const cartProductData = cart.products.find(
          prod => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty }); // cartProducts.push(product) - You need the other info as well
        }
      }

      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: cartProducts
      });
    });
  });
};

// "Add to Cart" button in "Product Detail" page
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId, product => {
    Cart.addProduct(prodId, product.price);
  });

  res.redirect("/cart");
};

// "Delete" button from "Cart" page
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect("/cart");
  });
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
