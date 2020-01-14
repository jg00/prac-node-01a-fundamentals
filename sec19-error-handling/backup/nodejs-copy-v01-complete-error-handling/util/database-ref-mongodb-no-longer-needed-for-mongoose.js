const mongodb = require("mongodb"); // MongoDb driver
const MongoClient = mongodb.MongoClient; // Mongo client constructor

// 2 Better approach - one connection to the server and reuse the client database connection.
let _db;

const mongoConnect = callback => {
  // Async code
  MongoClient.connect(
    // "mongodb+srv://bart:0BPmJVZdUUrIftYg@cluster0-f9pzz.mongodb.net/test?retryWrites=true&w=majority",
    // "mongodb+srv://bart:0BPmJVZdUUrIftYg@cluster0-f9pzz.mongodb.net/shop?retryWrites=true&w=majority",
    // "mongodb://localhost:27017/shop",
    // "mongodb://bart:0BPmJVZdUUrIftYg@cluster0-shard-00-00-f9pzz.mongodb.net:27017,cluster0-shard-00-01-f9pzz.mongodb.net:27017,cluster0-shard-00-02-f9pzz.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
    "mongodb://bart:0BPmJVZdUUrIftYg@cluster0-shard-00-00-f9pzz.mongodb.net:27017,cluster0-shard-00-01-f9pzz.mongodb.net:27017,cluster0-shard-00-02-f9pzz.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
    { useUnifiedTopology: true },
    { useNewUrlParser: true }
  )
    .then(client => {
      console.log("Connected to MongoDB Atlas Cluster");
      _db = client.db(); // Here we do store a connection to our database.  .db() by default connects to the 'test' databse.
      callback(); // Here no need to return the connection, just execute to start our Node server.
    })
    .catch(err => {
      console.log("HERE", err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect; // Method for connecting to the server one time and storing the connection to the database which we can reuse
exports.getDb = getDb; // Method for using the connection to the database whereever needed.

/*
  Note: the "/test" part in our connection string is the default database name.
  We can change it here in our connection string.

  If we leave _db = client.db() this connects to our default 'test' database.
  We can change the connection string from /test to /shop and that will create a 'shop' database (if it does not exits).

  We could also use _db = client.db('shop') 'overwrites' the database 'test' in the connection string.

  Note that with MongoDB we 'do not' need to create a database first.  If it does
  not exists, it will create it automatically.

  "mongodb+srv://bart:8VwlL1KI11Z7GYPA@cluster0-f9pzz.mongodb.net/test?retryWrites=true&w=majority"
*/

/*
    For running Node.js v3.0 or later from server (test db)     -> "mongodb+srv://bart:0BPmJVZdUUrIftYg@cluster0-f9pzz.mongodb.net/test?retryWrites=true&w=majority",
    For running Node.js v3.0 or later from server (shop db)     -> "mongodb+srv://bart:0BPmJVZdUUrIftYg@cluster0-f9pzz.mongodb.net/shop?retryWrites=true&w=majority",
    For running Locally                                         -> "mongodb://localhost:27017/shop",
    For running at Node.js v2.2 or later from public (shop db)  -> "mongodb://bart:0BPmJVZdUUrIftYg@cluster0-shard-00-00-f9pzz.mongodb.net:27017,cluster0-shard-00-01-f9pzz.mongodb.net:27017,cluster0-shard-00-02-f9pzz.mongodb.net:27017/shop?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
*/

/*
  - 1 Ref only - first approach - we end up using below to connect to the server 'everytime'.
  - Better approach is to connect the server one time and reuse our client {} connection whereever we need to.
  - .connect() returns a promise
  - In our set up we just returned a function we run in app.js
  and pass to it a callback that will start our Node server.
*/
/*
const mongoConnect = callback => {
  // Async code
  MongoClient.connect(
    "mongodb+srv://bart:8VwlL1KI11Z7GYPA@cluster0-f9pzz.mongodb.net/test?retryWrites=true&w=majority",
    { useUnifiedTopology: true }
  )
    .then(client => {
      console.log("Connected to MongoDB Atlas Cluster");
      callback(client); // client {} returned and gives us access to the database
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

module.exports = mongoConnect;
*/
