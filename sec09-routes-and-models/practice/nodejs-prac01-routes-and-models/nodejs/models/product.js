const fs = require("fs");
const path = require("path");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);

const getProductsFromFile = function(cb) {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

// Product class
module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  /* Use to add new or update existing product by checking if id already exists
      1 In both cases we need to get products first so the check for product id need to be inside of our callback after getting products from file
  */
  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          prod => prod.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;

        // fs.writeFile will always replace the old content
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log("Update product error:", err);
        });
      } else {
        // If Adding a new product, value of id is null
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log("Save product error:", err);
        });
      }
    });
  }

  static fecthAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(product => product.id === id);
      cb(product);
    });
  }
};
