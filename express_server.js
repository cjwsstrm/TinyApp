const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const urlDatabase = {
  "b2xVn2": {
    user: "userRandomID",
    longurl: "http://lighthouselabs.ca"
  },
  "95m5xK": {
    user: "",
    longurl: "http://google.com"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "user3randomID": {
    id: "user3randomID",
    email: "thebestemail@lhl.ca",
    password: bcrypt.hashSync("toogootobeguessed", 10)
  },
  "user4randomID": {
    id: "user4randomID",
    email: "worstemail@gmail.se",
    password: bcrypt.hashSync("areallybadone", 10)
  }
};

const userEmailExists = function (email) {
  for (user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    }
  }
};

const urlsForUser = function (id) {
  const urls = {};
  for (var shorturl in urlDatabase) {
    var urlObject = urlDatabase[shorturl];
    if (urlObject.user === id) {
      urls[shorturl] = urlObject;
    }
  }
  return urls;
};

//Used for user_id generation and shortURL creation
function generateRandomString() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options - below is set to 24 hours
  maxAge: 24 * 60 * 60 * 1000
}));

app.use( function (req, res, next) {
  console.log('User Middleware');
  res.locals.user_id = req.session.user_id;
  const userid = req.session.user_id;
  if (userid && userid in users) {
    res.locals.user = users[userid];
    res.locals.username = users[userid].email;
  } else {
    res.locals.username = undefined;
  }
  res.locals.userUrls = urlsForUser(req.session.user_id);
  console.log('userUrls', res.locals.userUrls)
  res.locals.urls = urlDatabase;
  res.locals.users = users;
  next();
});

app.get("/", (req, res) => {
  if (res.locals.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/new", (req, res) => {
  if (res.locals.user_id) {
    res.render("urls_new");
  } else {
    res.redirect('/login');
  }
});

app.post("/urls", (req, res) => {
  let randomKey = generateRandomString();
  let new_url = req.body['longURL'];
  urlDatabase[randomKey] = {
    user: res.locals.user_id,
    longurl: new_url
  };
  let redirectUrl = 'http://localhost:8080/urls/' + randomKey;
  res.redirect(redirectUrl);
});

app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL) {
    let longURL = urlDatabase[req.params.shortURL].longurl;
    res.redirect(longURL);
  } else {
    res.status(403).end("Does not exist");
  }
});

app.get("/urls", (req, res) => {
  if (res.locals.user_id) {
    res.render("urls_index");
  } else {
    res.status(403).end("Login for access!");
  }
});

app.get("/urls/:id", (req, res) => {
  if (!(req.params.id in urlDatabase)) {
    res.status(404).end("Does not exist");
  } else if (!res.locals.user_id) {
    res.status(403).end("Login for access");
  } else if (!(req.params.id in res.locals.userUrls)) {
    res.status(403).end("You do not have access to edit this URL");
  } else {
    res.render("urls_show", {shortURL: req.params.id});
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (res.locals.user_id) {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (res.locals.user_id) {
    let id = req.params.id;
    urlDatabase[id].longurl = req.body.URL;
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/login", (req, res) => {
  if (res.locals.user_id) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

app.post("/login", (req, res)  => {
  console.log('Login Body', req.body);
  const user = userEmailExists(req.body.email);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.id;
    res.redirect('/');
  } else {
    res.statusCode = 403;
    res.end(`${res.statusCode}`);
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.end(`${res.statusCode}`);
  }
  if (userEmailExists(req.body.email)) {
    res.statusCode = 400;
    res.end(`${res.statusCode}`);
  } else {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const randomKey = generateRandomString();
    users[randomKey] = {
      id: randomKey,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = randomKey;
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});
