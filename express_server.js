const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["MUSTAFA"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$bugSVEYB..hNIAx.TfMqEu2j2zkY2N5ucaggi2zwmX06Yp9iR54mK",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  // b2xVn2: "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// function generateRandomString() {
//   let len = 6;
//   return Math.random()
//     .toString(20)
//     .substr(2, `${len > 6 ? (len = 6) : (len = 6)}`);
// }

// function findUserEmail(users, email) {
//   for (let user in users) {
//     if (users[user].email == email) {
//       return users[user];
//     }
//   }
//   return null;
// }

// function urlsForUser(id) {
//   let userUrls = {};
//   for (let shortUrl in urlDatabase) {
//     if (urlDatabase[shortUrl].userID === id){
//         userUrls[shortUrl] = urlDatabase[shortUrl]
//     }
//   }
//   return userUrls;
// }

app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;

  const user = users[user_id];

  const userUrls = urlsForUser(user_id, urlDatabase);

  const templateVars = {
    user: user,
    urls: userUrls,
  };

  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;

  const user = users[user_id];

  if (user_id) {
    const templateVars = {
      user: user,
    };
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const shortURL = req.params.shortURL;
  if (user_id !== urlDatabase[shortURL].userID) {
    return res.send("you dont own this url");
  }

  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };

  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  // const { user_id } = req["cookies"];
  const user = users[user_id];
  if (!user_id) {
    res.redirect("/login");
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  const userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  if (urlDatabase[shortURL].userID === user_id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.send("error! you can not delete this URL");
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const user_id = req.session.user_id;
  console.log(user_id);
  if (!user_id) {
    res.redirect("/login");
  }
  if (urlDatabase[shortURL].userID === user_id) {
    urlDatabase[shortURL].longURL = req.body.newLongURL;
    res.redirect("/urls");
  } else {
    res.send("error! you can not edit this URL");
  }
});

app.get("/login", (req, res) => {
  const user = req.body.user_id;
  const templateVars = {
    user: user,
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("User not found");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Pass is wrong");
  }

  req.session.user_id = user.id;

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.cookie("User_id", user_id);
});

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;

  const user = users[user_id];
  const templateVars = {
    user: user,
  };
  console.log(templateVars);
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("fill out email and password");
  }
  const findUser = getUserByEmail(email, users);
  if (findUser) {
    return res.status(400).send("this user already exists");
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  const user = {
    id,
    email,
    password: hashedPassword,
  };

  users[id] = user;
  req.session.user_id = user.id;

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
