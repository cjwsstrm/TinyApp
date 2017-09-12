var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "95m5xK": "http://google.com"
};

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       keyURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/", (request, response) => {
  response.end("Hello!");
});

app.get("/urls/json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
