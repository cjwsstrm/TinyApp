const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

let urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "95m5xK": "http://google.com"
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (request, response) => {
  response.end("Hello!");
});

app.get("/urls/json", (request, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (request, response) => {
  response.end("<html><body>Hello <b>World</b></body></html>\n");
});

//app.get accepts a get request from the browser
app.get("/urls/new", (request, response) => {
  let templateVars = { shortURL: request.params.id,
                       keyURL: urlDatabase[request.params.id],
                      username: request.cookies['username']
                     };
  response.render("urls_new", templateVars);
});

app.post("/urls", (request, response) => {
  console.log(request.body);
  let randomKey = generateRandomString();
  let new_url = request.body['longURL'];
  urlDatabase[randomKey] = new_url;
  console.log(urlDatabase);
  let redirectUrl = 'http://localhost:8080/urls/' + randomKey
  response.redirect(redirectUrl);
});

app.get("/u/:shortURL", (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  console.log(longURL);
  response.redirect(longURL);
});

app.get("/urls", (request, response) => {
  let templateVars = { urls: urlDatabase,
                       keyURL: urlDatabase[request.params.id],
                       shortURL: request.params.id,
                       username: request.cookies['username']
                     };
  response.render("urls_index", templateVars);
});

app.get("/urls/:id", (request, response) => {
  let templateVars = { shortURL: request.params.id,
                       keyURL: urlDatabase[request.params.id],
                       username: request.cookies['username']
                      };
  response.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (request, response) => {
  delete urlDatabase[request.params.id];
  response.redirect("/urls");
});

app.post("/urls/:id", (request, response) => {
  let id = request.params.id;
   urlDatabase[id] = request.body.URL;
  response.redirect('/urls');
});

app.post("/login", (request, response)  => {
  console.log(request.body.username);
  response.cookie('username', `${request.body.username}`);
  response.redirect('/urls');
});

app.post("/logout", (request, response) => {
  response.clearCookie('username');
  response.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
