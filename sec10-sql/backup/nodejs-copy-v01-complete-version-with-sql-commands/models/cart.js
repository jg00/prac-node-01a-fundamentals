const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

/*
Note we are not creating a new instance of a Cart.
There will always be a cart and we just want to "manage" the products in there.
No constructor().
tip - We want to build a cart object, update as needed, push to the file

cart = 
  { 
    products: [ {id:1, qty: 2},
                {id:4, qty: 1}
              ],
    totalPrice: "11.99"
  }
*/

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 }; // Create a cart structure or populate
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // console.log("here", cart); // check

      // Find existing product in cart
      const existingProductIndex = cart.products.findIndex(
        product => product.id === id
      );
      const existingProduct = cart.products[existingProductIndex]; //  {id:1, qty: 2}

      // Update existing product or add a new product
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct }; // {id:1, qty: 2} ie object
        updatedProduct.qty = updatedProduct.qty + 1;

        cart.products = [...cart.products]; // [ {id:1, qty:1}, {id:4 qty:2} ] ie array of objects
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }

      // Update cart's totalPrice
      cart.totalPrice = cart.totalPrice + parseFloat(productPrice, 2);
      // cart.totalPrice = cart.totalPrice + +productPrice;

      // Persist new state of the full cart object
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log("Cart.addProduct", err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      // An err means no cart file found so we can simply return
      if (err) {
        return;
      }

      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find(prod => prod.id === id);

      // Need to check if we do have that product in the cart else no need to continue
      if (!product) {
        return;
      }

      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(
        prod => prod.id !== id
      );
      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * productQty; // Keep in mind that if we have the product three times for example, totalPrice shoiuld be reduced by product price * 3 (qty)

      // console.log("Check item removed from the cart", updatedCart);

      // Persist new state of the full cart object
      fs.writeFile(p, JSON.stringify(updatedCart), err => {
        console.log("Cart.deleteProduct", err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);

      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
