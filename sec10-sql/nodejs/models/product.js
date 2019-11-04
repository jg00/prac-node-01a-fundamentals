const db = require("../util/database"); // This is our pool object from our database.js file

const Cart = require("./cart");

// Product class
module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {}

  static deleteById(id) {}

  static fetchAll() {
    /* Why return the promise? We are interested in catching the returned data from the place we are calling the fetchAll(). */
    return db.execute(`SELECT * FROM products`);
  }

  static findById(id) {}
};
