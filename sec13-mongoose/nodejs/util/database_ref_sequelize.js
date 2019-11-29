/*
  Set up connection - https://sequelize.org/master/manual/getting-started.html
  Sequelize will set up a connection pool on initialization. 
*/

const { Sequelize } = require("sequelize"); // returns constructor function which we initialize

// This will set up the connection pool.
const sequelize = new Sequelize("node-complete", "root", "nodecomplete", {
  host: "localhost",
  dialect: "mysql"
});

module.exports = sequelize; // Essentially the database connection pool however this is managed by sequelized giving lots of features.
