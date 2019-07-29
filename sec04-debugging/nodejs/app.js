const http = require("http");

const routes = require("./routes");

const server = http.createServer(routes.handler);

/* Reference only
  const server = http.createServer((req, res) => {
    // console.log(req.url, req.method, req.headers);
    // console.log(req.url);

    // Code moved to routes.js
  });
*/

server.listen(3000);
console.log(routes.someText);
