const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users.filter(user => user.username === username).length > 0) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Add the new user
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve) => {
        resolve(books);
      });
    };
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err }));
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        const result = Object.values(books).filter(book => book.author === author);
        if (result.length > 0) {
          resolve(result);
        } else {
          reject("No books found for this author");
        }
      });
    };
    const booksByAuthor = await getBooksByAuthor();
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const getBooksByTitle = new Promise((resolve, reject) => {
    const result = Object.values(books).filter(book => book.title === title);
    if (result.length > 0) {
      resolve(result);
    } else {
      reject("No books found for this title");
    }
  });

  getBooksByTitle
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({ message: err }));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No review found for this book" });
  }
});

module.exports.general = public_users;