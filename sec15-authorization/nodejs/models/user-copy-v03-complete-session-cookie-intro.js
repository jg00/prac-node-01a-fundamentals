const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

// Can be called like req.user.addToCart(product)
userSchema.methods.addToCart = function(product) {
  // 1a Check if product item already exists. If it does find out it's quantity and update.
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items]; // Get new array with all items that are in the cart
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }

  /* 
    1b If no cart build cart with initial product and add a quantity field (We spread ...product because we also want to add a quantity property on the fly).
    const updatedCart = { items: [{ ...product, quantity: 1 }] };

    1c Key idea - In 1b we stored the product object.  However, issue will be if we change for example the product price, we would
    have to change in all user carts to reflect the change.  Better approach then is just to store the product id.
    const updatedCart = {
      items: [{ productId: new ObjectId(product._id), quantity: newQuantity }]
    };
  */

  // 1d New version
  const updatedCart = {
    items: updatedCartItems // updatedCartItems is array of objects
  };

  this.cart = updatedCart; // updatedCart is an object with property items array of products
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart; // { items: [ {productId:_, quantity:_}, {}, {} ] }
//     this._id = id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     // 1a Check if product item already exists. If it does find out it's quantity and update.
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//       return cp.productId.toString() === product._id.toString();
//     });

//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items]; // Get new array with all items that are in the cart

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity
//       });
//     }

//     // 1b If no cart build cart with initial product and add a quantity field (We spread ...product because we also want to add a quantity property on the fly).
//     // const updatedCart = { items: [{ ...product, quantity: 1 }] };

//     // 1c Key idea - In 1b we stored the product object.  However, issue will be if we change for example the product price, we would
//     // have to change in all user carts to reflect the change.  Better approach then is just to store the product id.
//     // const updatedCart = {
//     //   items: [{ productId: new ObjectId(product._id), quantity: newQuantity }]
//     // };

//     // 1d New version
//     const updatedCart = {
//       items: updatedCartItems
//     };

//     const db = getDb();

//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   /*
//       Notes for addToCart(product)

//       Add a quantity field on the fly (We spread ...product in order to be able to add the quantity field.)
//         First we pull out all properties of the product object we want to add using ...product and then add a quantity property.

//       One approach to add a field "quantity" on the fly to product object
//         const product.quantity = 1
//         const updatedCart = { items: [product]}
//     */

//   getCart() {
//     // return this.cart;  // We also could return the cart and all cart items

//     const db = getDb();
//     const productIds = this.cart.items.map(i => {
//       return i.productId;
//     });

//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } }) // This returns a cursor with all the matching products
//       .toArray() // convert cursor to javascript array
//       .then(products => {
//         // Now we need quantity for each product
//         return products.map(p => {
//           return {
//             ...p,
//             quantity: this.cart.items.find(i => {
//               return i.productId.toString() === p._id.toString();
//             }).quantity
//           };
//         });
//       });
//   }

//   deleteItemFromCart(productId) {
//     const updatedCartItems = this.cart.items.filter(item => {
//       return item.productId.toString() !== productId.toString();
//     });

//     const db = getDb();
//     return db.collection("users").updateOne(
//       { _id: new ObjectId(this._id) },
//       { $set: { cart: { items: updatedCartItems } } } // { cart: { items: [ {}, {}, {} ] } }
//     );
//   }

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

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       .find({ "user._id": new ObjectId(this._id) })
//       .toArray(); // We know we return more than one so we can use toArray() instead of next()
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection("users")
//       .find({ _id: new ObjectId(userId) }) // cursor object returned
//       .next(); // call next() to get the first item based on the cursor
//   }
// }

// module.exports = User;
