const express = require("Express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

function generateRandomString(number) {
  let string = "";
  let character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < number; i++) {
    string += character.charAt(Math.floor(Math.random() * character.length))
  }
  return string;
}
console.log(generateRandomString(6));
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/", (req, res) => {
  res.send("Hello!");
})
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
})
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})