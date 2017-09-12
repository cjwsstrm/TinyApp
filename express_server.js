var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

app.ser("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "95m5xK": "http://google.com"
};


app.get("/", (request, response) => {
  response.end("Hello!");
});

app.get("/urls/json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
