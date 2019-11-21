const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDb();
    return db
      .collection("products")
      .insertOne(this)
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  // CONTIUE HERE
  // static fetchAll() {
  //   const db = getDb();
  //   return db
  //     .collection("products")
  //     .find()
  //     .toArray();
  // }
}

module.exports = Product;

/*
  Notes:
  1 .find({title:"A book"}) - Returns all so be careful (Better to implement pagination)
  - We can use this function to get all our products
  - .find() does not immediately return a promise though, instead it
  returns a cursor object that allow us to go thourgh our documents step by step


  2 .find().toArray()
  - .toArray() here returns a promise
  - You could turn cursor object result to an array if you know there are
  only a dozen or so documents
*/

/*
// Ref only - Sequelize Model
// Define a model - https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-method-define
// Keep table name 'product' singulare and seqeulize will 'pluralize' as 'products when sequelize.sync() is executed in app.js
// With sequelize we don't define a model using class Product. Instead we use .define() method.
// .define() returns a typeof Model
const Product = sequelize.define("product", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },

  title: Sequelize.STRING,

  price: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },

  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Product;
*/
