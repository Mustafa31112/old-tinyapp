const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
let urlDatabase = {
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


function generateRandomString() {
  let len = 6;
  return Math.random()
    .toString(20)
    .substr(2, `${len > 6 ? (len = 6) : (len = 6)}`);
}

function findUserEmail(users, email) {
  for (let user in users) {
    if (users[user].email == email) {
      return users[user];
    }
  }
  return null;
}

function urlsForUser(id) {
  let userUrls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id){
        userUrls[shortUrl] = urlDatabase[shortUrl]
    }
  } 
  return userUrls;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const { user_id } = req["cookies"];
  const user = users[user_id];
  // if (!user_id) {
    
  //   res.redirect("/login");
  // }
  const userUrls = urlsForUser(user_id);
  // const templateVars = { urls: urlDatabase };
  const templateVars = {
    user: user,
    urls: userUrls,
    // ... any other vars
  };
  // res.render("urls_index", templateVars);
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const { user_id } = req["cookies"];
  const user = users[user_id];
  // console.log(user_id);
  if (user_id) {
    const templateVars = {
      user: user,
    };
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect("/login");
  // const templateVars = { urls: urlDatabase };
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const { user_id } = req["cookies"];
  const user = users[user_id];

  // const templateVars = { urls: urlDatabase };
  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    // ... any other vars
  };
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const { user_id } = req["cookies"];
  const user = users[user_id];
  if (!user_id) {
    res.redirect("/login");
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies.user_id
  urlDatabase = { ...urlDatabase, [shortURL]: { longURL, userID} };
  res.redirect(`/urls/`);
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.cookies.user_id;
  if (urlDatabase[shortURL].userID === user_id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    } else {
      res.send('error! you can not delete this URL')
    }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const { user_id } = req["cookies"];
  console.log(user_id);
  if (!user_id) {
    res.redirect("/login");
  }
  if (urlDatabase[shortURL].userID === user_id) {
    urlDatabase[shortURL].longURL = req.body.newLongURL;
    res.redirect("/urls");
} else {
  res.send('error! you can not edit this URL')
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
  const user = findUserEmail(users, email);

  if (!user) {
    return res.status(403).send("User not found");
  }

  if (password !== user.password) {
    return res.status(403).send("Pass is wrong");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.cookie("User_id", user_id);
});

app.get("/register", (req, res) => {
  const { user_id } = req["cookies"];
  const user = users[user_id];
  const templateVars = {
    user: user,

    // ... any other vars
  };
  console.log(templateVars);
  res.render("urls_registration", templateVars);
});

app.post("/register", (req, res) => {
  // const cookieVal = req.cookies['user_id']
  // if (cookieVal != null) {
  //   return res.redirect('/urls')
  // }

  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("fill out email and password");
  }
  const findUser = findUserEmail(users, email);
  if (findUser) {
    return res.status(400).send("this user already exists");
  }
  const id = generateRandomString();
  const user = {
    id,
    email,
    password,
  };
  users[id] = user;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
