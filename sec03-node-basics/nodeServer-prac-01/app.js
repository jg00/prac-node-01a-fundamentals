const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><h1>Create User</h1></head");
    res.write("<body>");
    res.write(
      "<form action='/create-user' method='POST'><input type='text' name='username' placeholder='username'></input><button type='submit'>Create User</button></form>"
    );
    res.write("</body>");
    res.write("</html>");
    res.end();
  }

  if (req.url === "/create-user" && req.method === "POST") {
    // console.log("test");

    const chunks = [];
    req.on("data", chunk => {
      //   console.log(chunk);
      chunks.push(chunk);
    });

    req.on("end", () => {
      const data = Buffer.concat(chunks).toString();
      console.log(data.split("=")[1]);
      //   return res.end();
    });

    // Redirect
    res.statusCode = 302;
    res.setHeader("Location", "/");
    res.end();
  }

  if (req.url === "/users") {
    const users = ["Bill", "Will", "Dean"];

    let userList = "<ul>";
    userList += users.map(user => `<li>${user}</li>`).join("");
    userList += "</ul>";

    console.log(userList);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><h1>Users</h1></head");
    res.write("<body>");
    res.write(userList);
    res.write("</body>");
    res.write("</html>");
    res.end();
  }
});

server.listen(3000);
