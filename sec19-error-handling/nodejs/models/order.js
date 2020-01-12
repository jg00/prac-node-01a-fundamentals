const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true }, // type: Object is just a shortcut but you could define a full nested product with all the properties
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    email: { type: String, required: true },
    // name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" }
  }
});

module.exports = mongoose.model("Order", orderSchema);

//   /*
//     1a Get cart items 'snapshot'
//     1b Create an order
//       - Want 'snapshot' of the products in the order colletions.  This is so we have a 'snapshot' of the product 'at the time' order placed.
//       - Want 'some' user data not all
//     2 Copy cart to the order
//     3 Empty cart items
//     4 Also clear user cart in the database
//   */
//   addOrder() {
//     const db = getDb();

//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products, // Here we get all product info "at the time".  If product price changes, we still need the snapshot of what it was previvously. The price change should not affect the 'past' order so we do not want to update the price on the order.
//           user: {
//             _id: new ObjectId(this._id),
//             name: this.name // It's okay to keep some user info like name.  If this name changed we don't have to change it in all the orders.
//             // email: this.email // Again here we don't care about this info because user info could change.
//           }
//         };

//         return db.collection("orders").insertOne(order);
//       })
//       .then(result => {
//         this.cart = { items: [] };

//         return db
//           .collection("users")
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           );
//       });
//   }
