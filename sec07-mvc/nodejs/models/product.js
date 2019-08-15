/*
- Note the file name is product.js "singular" because in the
end we want to represent a single entity. ex: { title: req.body.title }

Multiple ways to represent our entity:
ES5:        module.exports = function Product() { ... }
NextGenJS:  module.exports = class Product { ... }

'this' will refer to the object created based on the class Product
and that is the exactly the object {} we want to store in products array []
*/

// Save to file
const fs = require("fs");
const path = require("path");

module.exports = class Product {
  constructor(t) {
    this.title = t;
  }

  save() {
    const p = path.join(
      path.dirname(process.mainModule.filename),
      "data",
      "products.json"
    );

    // Note to ensure that 'this' refers to the class you need to use arrow function, otherwise 'this' will lose it's context and will not refer to the class anymore
    // File is created if it does not exists
    fs.readFile(p, (err, fileContent) => {
      console.log("1", fileContent); // undefined could mean no file found
      console.log("2", err);
      let products = [];

      // In this case we know the file is a .json file
      // JSON helper object that exists in vanilla NodeJs
      // JSON.parse() takes incoming JSON and gives us a Javascript array or object or whatever is in the file
      if (!err) {
        products = JSON.parse(fileContent);
      }
      products.push(this); // Regardless if file exists it still pushes 'this' received from when the product object was created.

      // By this time a file should have been created by .readFile if one did not exits.
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log("3", err);
        console.log("4", JSON.stringify(products));
      });
    });
  }

  static fetchAll() {
    return products;
  }
};

// 1 Save to Array
/*
const products = []; 

module.exports = class Product {
  constructor(t) {
    this.title = t;
  }

  save() {
    products.push(this);
  }

  static fetchAll() {
    return products;
  }
};
*/
