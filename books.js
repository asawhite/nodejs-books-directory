const express = require('express');
const router = express.Router();

const books = require('./books.json');
const bookSchema = require('./book-schema.json');

const {
	Validator,
	ValidationError,
} = require('express-json-validator-middleware');

const { validate } = new Validator({removeAdditional: true});

function validationErrorMiddleware(error, req, res, next) {
	if (res.headersSent) {
		return next(error);
	}

	const isValidationError = error instanceof ValidationError;
	if (!isValidationError) {
		return next(error);
	}

	res.status(400).json({
		errors: error.validationErrors,
	});

	next();
}

function validateContentType(req, res, next) {
	if (!req.is('application/json')) {
		res.sendStatus(415);
	} else {
		next();
	}
}

function getSchema(req) {
	let schema = bookSchema
	if (req.method === "PUT") {
		return schema
	}

	if (req.method === "POST") {
		schema.required = ["name", "author"]
		return schema
	}
}

router.use(express.json());

// Get all books
router.get('/', (req, res) => {
	res.json(books);
});

// Get a book by id
router.get('/:id', (req, res) => {
	const { id } = req.params;
	res.json(books.filter((ele) => ele.id === parseInt(id)));
});

// Post new book
router.post('/', validateContentType, validate({ body: getSchema }), (req, res, next) => {
	const data = req.body;
	console.log(data);

	book = Object.assign({id: books.length + 1}, data);
	books.push(book);
	res.json({ message: 'The book has been added' });

	next();
});

// Update existing book
router.put('/:id', validateContentType, (req, res) => {
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

router.use(validationErrorMiddleware);

module.exports = router;
