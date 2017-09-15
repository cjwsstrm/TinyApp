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
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options - below is set to 24 hours
  maxAge: 24 * 60 * 60 * 1000
}));

app.use( function (request, response, next) {
  response.locals.user_id = request.session.user_id;
  const userid = request.session.user_id;
  if (userid && userid in users) {
    response.locals.user = users[userid];
    response.locals.username = users[userid].email;
  } else {
    response.locals.username = undefined;
  }
  response.locals.userUrls = urlsForUser(request.session.user_id);
  response.locals.urls = urlDatabase;
  response.locals.users = users;
  next();
});

app.get("/", (request, response) => {
  if (response.locals.user_id) {
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

//Commented out sections below used during development
// app.get("/urls/json", (request, response) => {
//   response.json(urlDatabase);
// });

// app.get("/hello", (request, response) => {
//   response.end("<html><body>Hello <b>World</b></body></html>\n");
// });


app.get("/urls/new", (request, response) => {
  if (response.locals.user_id) {
    response.render("urls_new");
  } else {
    response.redirect('/login');
  }
});

app.post("/urls", (request, response) => {
  let randomKey = generateRandomString();
  let new_url = request.body['longURL'];
  urlDatabase[randomKey] = {
    user: response.locals.user_id,
    longurl: new_url
  };
  for (var user in urlDatabase) {
    urlDatabase[user].user = response.locals.user_id;
  }
  let redirectUrl = 'http://localhost:8080/urls/' + randomKey;
  response.redirect(redirectUrl);
});

app.get("/u/:shortURL", (request, response) => {
  if (request.params.shortURL) {
    let longURL = urlDatabase[request.params.shortURL].longurl;
    response.redirect(longURL);
  } else {
    response.status(403).end("Does not exist");
  }
});

app.get("/urls", (request, response) => {
  if (response.locals.user_id) {
    response.render("urls_index");
  } else {
    response.status(403).end("Login for access!");
  }
});

app.get("/urls/:id", (request, response) => {
  if (response.locals.user_id) {
    response.render("urls_new");
  } if (!request.params.shortURL) {
    response.status(403).end("Does not exist");
  } if (response.locals.user_id && !urlDatabase[user].user) {
    response.status(403).end("You do not have access to edit this URL");
  } else {
    response.status(403).end("Login for access");
  }
});


//
// if a URL for the given ID does not exist:
// (Minor) returns HTML with a relevant error message
// if user is not logged in:
// returns HTML with a relevant error message
// if user is logged it but does not own the URL with the given ID:
// returns HTML with a relevant error message

app.post("/urls/:id/delete", (request, response) => {
  if (response.locals.user_id) {
    delete urlDatabase[request.params.id];
  }
  response.redirect("/urls");
});

app.post("/urls/:id", (request, response) => {
  if (response.locals.user_id) {
    let id = request.params.id;
    urlDatabase[id].longurl = request.body.URL;
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

app.get("/login", (request, response) => {
  if (response.locals.user_id) {
    response.redirect('/urls');
  } else {
    response.render('login');
  }
});

app.post("/login", (request, response)  => {
  const user = userEmailExists(request.body.email);
  if (user && bcrypt.compareSync(request.body.password, user.password)) {
    request.session.user_id = user.id;
    response.redirect('/');
  } else {
    response.statusCode = 403;
    response.end(`${response.statusCode}`);
  }
});

app.post("/logout", (request, response) => {
  request.session = null;
  response.redirect('/login');
});

app.get("/register", (request, response) => {
  if (response.locals.user_id) {
    response.redirect('/urls');
  } else {
    response.render('register');
  }
});


app.post("/register", (request, response) => {
  if (!request.body.email || !request.body.password) {
    response.statusCode = 400;
    response.end(`${response.statusCode}`);
  }
  if (userEmailExists(request.body.email)) {
    response.statusCode = 400;
    response.end(`${response.statusCode}`);
  } else {
    const password = request.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const randomKey = generateRandomString();
    users[randomKey] = {
      id: randomKey,
      email: request.body.email,
      password: hashedPassword
    };
    request.session.user_id = randomKey;
    response.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});
