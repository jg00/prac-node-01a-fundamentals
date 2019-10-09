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
      cart.totalPrice = cart.totalPrice + +productPrice;

      // Persist new state of the full cart object
      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log("Cart.addProduct", err);
      });
    });
  }
};
