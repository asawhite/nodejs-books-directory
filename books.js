const express = require('express');
const router = express.Router();
const books = require('./books.json');

// Get all the books
router.get('/', (req, res) => {
  res.json(books);
});

// Get a specific book
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json(books.filter((ele) => ele.id === parseInt(id)));
});

router.use('/', (req, res, next) => {
  if (!req.is('application/json')) {
    res.status(400).json({message: 'Request content not formatted correctly'})
  } else {
    next();
  }
});

router.post('/', (req, res) => {
  const body = req.body;
  console.log(body);

  if (!body.name || !body.author) {
    res.status(400).json({message: 'One or more required fields are empty'})
  } else {
    let book = {
      id: books.length + 1,
      name: body.name,
      author: body.author
    }
    books.push(book);
    res.json({ message: 'The book has been added' });
  }
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const body = req.body;
  console.log(body);
  books.forEach((book, index) => {
    if (book.id === parseInt(id)) {
      books[index] = body;
    }
  });
  res.json({ message: `The book with ID ${id} has been updated` });
  // res.json(books);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  books.forEach((book, index) => {
    if (book.id === parseInt(id)) {
      books.splice(index);
    }
  });
  res.json({ message: `Book with id #${id} has been deleted` });
});

module.exports = router;
