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
    // console.log("this:", this);  // this: Product { title: 'Mastery2' }
    const p = path.join(
      path.dirname(process.mainModule.filename),
      "data",
      "products.json"
    );

    // Note to ensure that 'this' refers to the class you need to use arrow function, otherwise 'this' will lose it's context and will not refer to the class anymore
    // .readFile() does not create a file if it does not exists.
    fs.readFile(p, (err, fileContent) => {
      let products = [];

      // In this case we know the file is a .json file
      // JSON helper object that exists in vanilla NodeJs
      // JSON.parse() takes incoming JSON and gives us a Javascript array or object or whatever is in the file
      if (!err) {
        products = JSON.parse(fileContent);
      }
      products.push(this); // Regardless if file exists it still pushes 'this' received from when the product object was created.

      // .writeFile() will create a file if it does not exits.  If will also replace an existing file.
      // JSON.stringyfy() takes Javascript array or object and converts it to JSON
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  // Ref controllers/products.js > exports.getProducts
  static fetchAll(cb) {
    const p = path.join(
      path.dirname(process.mainModule.filename),
      "data",
      "products.json"
    );

    // Remember this is async code and will require a callback
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        // return []; // Empyt array because that is what fetchAll expects.
        // Remember if 'return [];' here we get undefined and our view show.js will get an error.
        // Instead of returning an array we execute the callback function passed into fetchAll()
        cb([]);
      }

      // If no error and once you retrieve the data asynchronously, execute the callback cb(products)
      cb(JSON.parse(fileContent)); // Executing this callback will call the res.render('shop', {...})
    });
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
