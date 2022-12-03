const process = require('process')
process.chdir(__dirname)
const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');

const port = 3000;
const app = express();

const database = {};

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(session({
  secret: 'my-secret',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true
  }
}));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  // res.header("X-Frame-Options", "DENY"); // Add this line to prevent clickjacking
  if (req.session.user) {
    res.render('index', { user: req.session.user });
  }
  else {
    res.redirect('/login');
  }
});

app.get("/login", function (req, res) {
  req.session.destroy();
  res.render("login", { username: 'username', password: 'password' });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  req.session.user = {
    username: username,
    password: password,
    accepted: database[username],
  }
  res.redirect("/");
});

app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/login");
});

app.post('/reject', function (req, res) {
  if (req.session.user && req.session.user.accepted === undefined) {
    database[req.session.user.username] = false;
    req.session.user.accepted = false;
  }
  res.redirect('/');
});

app.post("/accept", function (req, res) {
  if (req.session.user && req.session.user.accepted === undefined) {
    database[req.session.user.username] = true;
    req.session.user.accepted = true;
  }
  res.redirect("/");
});

app.listen(port, () => console.log(`The server is listening at http://localhost:${port}`));
