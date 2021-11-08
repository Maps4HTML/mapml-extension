const http = require("http")
const fs = require("fs")
const path = require("path")

const server = http.createServer((req, res) => {

  let filePath = path.join(__dirname, req.url);
  let isJS = req.url.slice(-2) === "js";
  if (fs.existsSync(filePath)) {
    let file = fs.readFileSync(filePath, 'utf-8')
    if (isJS) res.setHeader("Content-Type", "text/javascript");
    res.write(file)
    console.log(`200 - ${req.url}`);
  } else {
    res.writeHead(404);
    console.log(`404 - ${req.url}`);
  }
  res.end();
});

server.listen(30002);

console.log("Test server started.");