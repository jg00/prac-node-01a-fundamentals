const mongodb = require("mongodb");
const getDb = require("../util/database").getDb;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart; // { items: [{product:_, quantity:_}, {}]}
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    // 1a Check if product item already exists. If it does find out it's quantity and update.
    // const cartProduct = this.cart.items.findIndex(cp => {
    //   return cp._id === product._id
    // })

    // 1b If no cart build cart with initial product and add a quantity field (We spread ...product because we also want to add a quantity property on the fly).
    const updatedCart = { items: [{ ...product, quantity: 1 }] };
    const db = getDb();

    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  /*
      Notes for addToCart(product)

      Add a quantity field on the fly (We spread ...product in order to be able to add the quantity field.)
        First we pull out all properties of the product object we want to add using ...product and then add a quantity property.

      One approach to add a field "quantity" on the fly to product object
        const product.quantity = 1
        const updatedCart = { items: [product]}
    */

  static findById(userId) {
    const db = getDb();
    return db
      .collection("users")
      .find({ _id: new ObjectId(userId) }) // cursor object returned
      .next(); // call next() to get the first item based on the cursor
  }
}

module.exports = User;
