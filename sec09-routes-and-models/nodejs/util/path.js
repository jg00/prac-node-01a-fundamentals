/*
  From main caller use
  const rootDir = require("../util/path");
*/

const path = require("path");
module.exports = path.dirname(process.mainModule.filename);
