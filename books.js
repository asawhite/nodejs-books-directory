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

// Content type validation used by POST and PUT requests
function validateContentType(req, res, next) {
	if (!req.is('application/json')) {
		res.sendStatus(415);
	} else {
		next();
	}
}

// Validates book exists for PUT and DELETE requests
function validateBookExists(req, res, next) {
	const { id } = req.params;

	let index = books.findIndex(item => item.id === parseInt(id));

	if (index === -1) {
		res.sendStatus(404);
	} else {
		req.bookId = id;
		req.bookIndex = index;
		return next();
	}
}

// Modifies and returns schema based on request method
function getSchema(req) {
	if (req.method === "PUT") {
		return bookSchema;
	}

	if (req.method === "POST") {
		let schema = Object.assign({required: ["name", "author"]});
		return schema;
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

	let book = Object.assign({id: books.length + 1}, data);
	books.push(book);
	res.json({ message: 'The book has been added' });

	next();
});

// Update existing book
router.put('/:id', validateContentType, validate({ body: getSchema }), validateBookExists, (req, res, next) => {
	const body = req.body;
	console.log(body);

	let index = req.bookIndex;
	let book = books[index];

	for (const key in body) {
		if (Object.hasOwnProperty.call(book, key)) {
			const value = body[key];
			books[index][key] = value;
		}
	}

	res.json({ message: `The book with ID ${req.bookId} has been updated` });
	next();
});

// Delete book by id
router.delete('/:id', validateBookExists, (req, res) => {
	books.splice(req.bookIndex, 1);

	res.json({ message: `Book with id #${req.bookId} has been deleted` });
});

router.use(validationErrorMiddleware);

module.exports = router;
