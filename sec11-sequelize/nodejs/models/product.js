const Sequelize = require("sequelize"); // Sequelize uppercase 'S' b/c the constructor function is returned
const DataTypes = require("sequelize/lib/data-types"); // convenience class
const sequelize = require("../util/database"); // sequelize lowercase 's' b/c this is the database connection pool managed by sequelize

// Define a model - https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-method-define
// Keep table name 'product' singulare and seqeulize will 'pluralize' as 'products when sequelize.sync() is executed in app.js
const Product = sequelize.define("product", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: DataTypes.STRING,
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
