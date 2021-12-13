// const getUserByEmail = function(email, database) {

//   return user;
// };

const generateRandomString = function() {
  let len = 6;
  return Math.random()
    .toString(20)
    .substr(2, `${len > 6 ? (len = 6) : (len = 6)}`);
};

const getUserByEmail = function(email, database) {
  for (let user in database) {
    if (database[user].email == email) {
      return database[user];
    }
  }
  return null;
};

const urlsForUser = function (id, urlDatabase) {
  let userUrls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userUrls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};
