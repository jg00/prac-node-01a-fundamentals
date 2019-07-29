const fs = require("fs");
const path = require("path");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    res.write("<html>");
    res.write("<head><title>Node Server</title></head>");
    res.write(
      "<body><form action='/message' method='POST'><input type='text' name='message'/><button type='submit'>Send</button></form></body>"
    );
    res.write("</html>");
    return res.end();
  }

  if (url === "/message" && method === "POST") {
    // How do you work with chunks of data? Your code works with a buffer to organize these chunks.
    // Stream -> Req Body Pt 1 -> Req Body Pt 2 -> Req Body Pt 3 -> Fully Parsed
    // Buffer: (Req Body Pt 2 -> Req Body Pt 3)

    const body = [];

    // .on('data', {}) method binds an event to an object.  'Data' event fired whenever a new chunk is ready to be read.  We receive a 'chunk' of data.
    req.on("data", chunk => {
      console.log("chunk: ", chunk); // <Buffer 6d 65 73 73 61 67 65 3d 61 61 61>
      body.push(chunk);
    });

    // Fired whenever the incoming request is done.  At this point we can now rely on all of the chunks being read in.
    // To work with these chunks we now have to Buffer them to be able to work with them.
    // Buffer is available globally by Nodejs
    // Add a 'return' below so it does not execute lines after this block of code.
    return req.on("end", () => {
      console.log("Buffer.concat(body): ", Buffer.concat(body));
      const parsedBody = Buffer.concat(body).toString(); // Add all your chunks from inside body [chunk1, chunk2, chunk3, ...] to the Buffer and .toString().
      console.log("Buffer.concat(body).toString(): " + parsedBody); // message=aaa; 'message' is the name of our text input we defined.

      const message = parsedBody.split("=")[1];

      // fs.writeFileSync("message.txt", message); // Use writeFile instead to run async code.
      // console.log(path.join(__dirname, "message.txt"));
      fs.writeFile(path.join(__dirname, "message.txt"), message, err => {
        // This response should be set only when we are done with the file.
        // res.writeHead(302, { Location: "/" });
        res.statusCode = 302; // 302 Found is a common way of performing URL redirection
        res.setHeader("Location", "/"); // "Location" is a default header accepted by the browser
        return res.end();
      });
    });
  }

  res.setHeader("Content-Type", "text/html");
  res.write("<html>");
  res.write("<head><title>Node Server</title></head>");
  res.write("<body><h1>Hello from my Node.js Server!</h1></body>");
  res.write("</html>");
  res.end();
};

module.exports.handler = requestHandler;
exports.someText = "Some hard coded text!";

/* Another option for exporting multiple items
module.exports = {
    handler: requestHandler,
    someText: 'Some hardcoded text'
}
*/

/* Another way to export multiple items.  exports is an {} object
    module.exports.handler = requestHandler
    module.exports.someText = 'Some hard coded text'

    or shortcut

    exports.handler = requestHandler
    exports.someText = 'Some hard coded text'
*/
