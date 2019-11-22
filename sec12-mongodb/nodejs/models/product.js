const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = mongodb.ObjectId(id); // May be "undefined" when creating an "instance" of the product
  }

  save() {
    const db = getDb();
    let dbOp;

    if (this._id) {
      // Update the  existing product
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this }); // Note: _id will not be overwritten
      // .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this }); // Note: _id will not be overwritten
      // dbOp = db.collection('products').updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {title: this.title}}) // More verbose way also works
    } else {
      // Insert the new product
      dbOp = db.collection("products").insertOne(this);
    }

    return dbOp
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  }

  /*
    .updateOne({find document}, {"specify how to update" that document (we do not do 'this')})
      - Second argument does not take 'this' object becasue .updateOne() does not 'replace' the document
      - {$set: {}} - We instruct MongoDB to set the key/value pairs to the document we found in the database
  */

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find() // returns a cursor {} object (not a promise)
      .toArray() // places results into an [] and returns the promise
      .then(products => {
        // console.log("HERE", products);
        return products; // using a 'return' in a .then() is like 'return Promise.resolve(products)'
      })
      .catch(err => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();
    return (
      db
        .collection("products")
        // .find({ _id: prodId }) // Still returns you a cursor; Note you can't compare _id: to a string.
        .find({ _id: new mongodb.ObjectId(prodId) }) // Note that _id:ObjectId("....")
        .next() // Run next() to get the last document found by .find()
        .then(product => {
          console.log("HERE", product); // Note that _id:ObjectId("....")
          return product;
        })
        .catch(err => console.log(err))
    );
  }
}

module.exports = Product;

/*
  Notes:
  1 .find({title:"A book"}) - Returns all so be careful (Better to implement pagination)
  - .find() does not immediately return a promise though, instead it
  returns a cursor object {} that allow us to go thourgh our documents step by step


  2 .find().toArray()
  - .toArray() places data into an array [] and then returns a promise
  - You could turn cursor object result to an array if you know there are
  only a dozen or so documents.
  
  3 pagination
  - Use this instead of .toArray() for large number of documents to be returned
  over the wire

  4 .find({ _id: new mongodb.ObjectId(prodId)})
  - You need 'mongodb' to get access to the ObjectId type.
  - Note that _id is an Object ->  _id:ObjectId("....")
  - Therefore you can't compare _id: to a string.
*/
