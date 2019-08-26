const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

/* Example:
    {
      products: [{id: "12345", qty: 1},
                 {id: "22222", qty: 2}], 
      totalPrice: 30
    }
*/

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // Fetch the previous cart.  Async code.
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        cart = JSON.parse(fileContent); // Copy of the cart object from the JSON file
      }

      // Anaylyze the cart ie find existing product.  Tip: to replace an item in an array we will need the index
      const existingProductIndex = cart.products.findIndex(
        prod => prod.id === id
      );

      const existingProduct = cart.products[existingProductIndex]; // A product { id: "12345", qty: 1 };

      let updatedProduct;

      // Add new product or increase quantity
      if (existingProduct) {
        // Take existing properties and add to a new javascript object
        updatedProduct = { ...existingProduct }; // {id: "12345", qty: 1}; => before
        updatedProduct.qty = updatedProduct.qty + 1; // {id: "12345", qty: 2}; => after

        cart.products = [...cart.products]; // [ {id: "12345", qty: 1}, {id: "22222", qty: 2} ] => before
        cart.products[existingProductIndex] = updatedProduct; // [ {id: "12345", qty: 2}, {id: "22222", qty: 2} ] => after
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct]; // Still update the products [] immutably and then add the new Product with qty 1
      }

      cart.totalPrice = cart.totalPrice + +productPrice; // totalPrice is an integer and we can upate directly

      fs.writeFile(p, JSON.stringify(cart), err => {
        console.log("Write to cart error: ", err); // null if no err
      });
    });
  }
};
