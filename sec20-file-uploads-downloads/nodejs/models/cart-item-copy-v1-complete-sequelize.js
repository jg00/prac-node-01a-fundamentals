const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const CartItem = sequelize.define("cartItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quantity: Sequelize.INTEGER
});

module.exports = CartItem;

/*
  -> CartItem is essentially combination of a product and id of the cart.

  -> When creating our n:m association, we specify that CartItems Model,
  will be used as the "joining table".

  Where are the foreign keys?
  -> With Sequelize, we don't add the FK cartId of the cart in the Model.  We let the
  Sequelize association we create handle that.
  -> FK productId will also be handled by Sequelize association.
*/
