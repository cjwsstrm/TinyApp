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

for (var i in urlDatabase) {
  console.log(Object.keys(urlDatabase[i]));
  console.log(urlDatabase[i])
}
