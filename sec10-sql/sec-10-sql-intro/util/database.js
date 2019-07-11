/*
    1 This is a Node.js driver for mysql. This allows us to write SQL code and execute in Node and interact with a database.
    2 Connect to your database from our application.
    3 Return a connection object which allows us to run queries.
    
    4 Two ways to connect to db
        1 Set up one connection we can then use to run queries and close connection.
        Downside is we need to re-execute code to create the connection for every new query.
            mysql.createConnection
        
        2 Better way is to create a connection pool      
        - The connetion pool will allow us to reach out to it whenever we have a query to run.
        We get a new connection from that pool which manages multiple connections so we can 
        run multiple queries simultaneously because "each query needs it's own connection".
        
        - Once the query is done the connection will be handed back to the pool and it is 
        available again for a new query.  The pool can then be finished once our application
        shuts down.
            mysql.createPool

*/
const mysql = require("mysql2");

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "nodecomplete",
  database: "node-complete"
});

module.exports = pool.promise();
