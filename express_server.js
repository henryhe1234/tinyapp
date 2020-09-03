const express = require("Express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
let morgan = require('morgan');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(morgan('dev'));

const generateRandomString = (number) => {
  let string = "";
  let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < number; i++) {
    string += character.charAt(Math.floor(Math.random() * character.length))
  }
  return string;
}


const urlDatabase = {
  // "9sm5xK": "http://www.google.com",
  // "b2xVn2": "http://www.lighthouselabs.ca"
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  sgq3y6: { longURL: "http://www.bilibili.ca", userID: "userRandomID" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
const foundUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user
    }
  }
  return null;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/login", (req, res) => {
  res.render('urls_login');
});
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (!foundUserByEmail(email)) {
    res.status(403);
    return res.send("email did not found")
  } else if (foundUserByEmail(email).password !== password) {
    res.status(403);
    return res.send("wrong password");
  }
  res.cookie("user_id", foundUserByEmail(email).id);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
})
app.get("/urls", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }
  let filterdDatabse = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === req.cookies["user_id"]) {
      filterdDatabse[url] = urlDatabase[url];
    }
  }

  let templateVars = { user: users[req.cookies["user_id"]], urls: filterdDatabse };

  res.render('urls_index', templateVars);
})
app.post("/urls", (req, res) => {
  let randomNumberString = generateRandomString(6);
  urlDatabase[randomNumberString] = { "longURL": req.body["longURL"], "userID": req.cookies["user_id"] };
  res.redirect(`/urls/${randomNumberString}`);        // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }
  let templateVars = { user: users[req.cookies["user_id"]] }
  return res.render("urls_new", templateVars);

});
app.get("/urls/registration", (req, res) => {
  res.render("urls_registration");
});
app.post("/urls/registration", (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    return res.send('email or password is empty');
  }
  if (foundUserByEmail(email)) {
    res.status(400);
    return res.send('email aready exist');
  }

  let id = generateRandomString(6);
  let userobject = { id, email, password };
  users[id] = userobject;
  res.redirect("/urls");
});
app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] };

  res.render('urls_show', templateVars);

});
app.post("/urls/:shortURL", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }
  urlDatabase[req.params.shortURL]["longURL"] = req.body["longURL"];
  res.redirect("/urls");
});
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})