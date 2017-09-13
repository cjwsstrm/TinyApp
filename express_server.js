const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
let urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "95m5xK": "http://google.com"
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

app.post("/urls", (request, response) => {
  console.log(request.body);
  let randomKey = generateRandomString();
  let new_url = request.body['longURL'];
  urlDatabase[randomKey] = new_url;
  console.log(urlDatabase);
  let redirectUrl = 'http://localhost:8080/urls/' + new_url
  // response.send(`This is your random ShortURL: ${randomKey}`);
  response.redirect(redirectUrl);
});

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id,
                       keyURL: urlDatabase[request.params.id]};
  response.render("urls_show", templateVars);
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

function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
