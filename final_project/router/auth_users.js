const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  return users.filter(user => user.username === username).length > 0;
}

const authenticatedUser = (username, password) => { //returns boolean
  return users.filter(user => user.username === username && user.password === password).length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.json({ message: "Login error" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.send("User successfully logged in");
  } else {
    return res.json({ message: "Invalid login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.json({ message: "User not authenticated" });
  }
  if (!books[isbn]) {
    return res.json({ message: "Book not found" });
  }
  if (!review) {
    return res.json({ message: "Review is required" });
  }

  books[isbn].reviews = books[isbn].reviews || {};
  books[isbn].reviews[username] = review;
  return res.json({ message: "Review added/modified successfully", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.json({ message: "User not authenticated" });
  }
  if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.json({ message: "No review found for this user" });
  }

  delete books[isbn].reviews[username];
  return res.json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;