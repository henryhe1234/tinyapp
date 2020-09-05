const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const foundUserByEmail = require('./helpers');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["JustAString"]
}));
app.use(morgan('dev'));

const generateRandomString = (number) => {
  let string = "";
  let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < number; i++) {
    string += character.charAt(Math.floor(Math.random() * character.length));
  }
  return string;
};


const urlDatabase = {
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
};

//redirect to url home pages
app.get("/", (req, res) => {
  res.redirect("/urls");
});
//showing html for user to log  in
app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {

    return res.redirect("/urls");
  }
  let templateVars = { user: users[req.session.user_id] };
  res.render('urls_login', templateVars);
});
//handle user login compare the email and password in database
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (!foundUserByEmail(email, users)) {
    res.status(403);
    return res.send("email did not found");
  } else if (!bcrypt.compareSync(password, foundUserByEmail(email, users).password)) {
    res.status(403);

    return res.send("wrong password");
  }
  req.session.user_id = foundUserByEmail(email, users).id;
  res.redirect("/urls");
});
//handle user logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;

  res.redirect("/urls");
});
//render the url home page
app.get("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.render('error');
  }
  let filterdDatabse = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === req.session.user_id) {

      filterdDatabse[url] = urlDatabase[url];
    }
  }
  let templateVars = { user: users[req.session.user_id], urls: filterdDatabse };


  res.render('urls_index', templateVars);
});
//add a url to database
app.post("/urls", (req, res) => {
  let randomNumberString = generateRandomString(6);
  urlDatabase[randomNumberString] = { "longURL": req.body["longURL"], "userID": req.session.user_id };
  console.log(urlDatabase);
  res.redirect(`/urls/${randomNumberString}`);        // Respond with 'Ok' (we will replace this)
});
//render html for user to put in new url
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {

    return res.render('error');
  }
  let templateVars = { user: users[req.session.user_id] };

  return res.render("urls_new", templateVars);

});
//render html for user registration
app.get("/urls/registration", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('urls_registration', templateVars);
});
//handle user registration, put user info in database
app.post("/urls/registration", (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    return res.send('email or password is empty');
  }
  if (foundUserByEmail(email, users)) {
    res.status(400);
    return res.send('email aready exist');
  }

  let id = generateRandomString(6);
  password = bcrypt.hashSync(password, 2);
  let userobject = { id, email, password };
  users[id] = userobject;
  res.redirect("/urls");
});
//render html for user to edit their url
app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id]) {

    return res.render('error');

  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.send("this url is not yours!");
  }
  if (!req.session.user_id) {
    res.send('TypeError: Cannot read property" userID" of undefined');
  }
  let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"] };

  res.render('urls_show', templateVars);

});
//modify existing url in database
app.post("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id]) {

    return res.render('error');

  }

  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.send("this url is not yours!");
  }
  urlDatabase[req.params.shortURL]["longURL"] = req.body["longURL"];
  return res.redirect("/urls");
});
//delete url in database
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!users[req.session.user_id]) {

    return res.render('error');

  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.send("this url is not yours!");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
//redirect user to longURL
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]["longURL"]) {
    res.send("the correspond long url does not exist");
  }
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});
//server up
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});