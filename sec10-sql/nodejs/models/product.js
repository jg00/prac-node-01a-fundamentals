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

  save() {
    // return the promise to the caller
    // console.log(this); Product {id:null, title:'test', imageUrl:'..', description:'..', price:'2'}
    return db.execute(
      "INSERT INTO products (title, price, imageUrl, description) VALUES (?,?,?,?)",
      [this.title, this.price, this.imageUrl, this.description]
    );
  }

  static deleteById(id) {}

  static fetchAll() {
    /* Why return the promise? We are interested in catching the returned data from the place we are calling the fetchAll(). */
    return db.execute(`SELECT * FROM products`);
  }

  static findById(id) {}
};
