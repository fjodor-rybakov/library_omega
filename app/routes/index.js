const errs = require('restify-errors'),
	  ObjectID = require('mongodb').ObjectID;

let message = 'This library app. accept requests: /books - добавление книги (post, необходимые параметры в body: name, link, authors, description, year); /books/:id - получить информацию о книге по id (get) /booking - забронировать книгу или снять бронь (post, необходимые параметры в body: id, name, available); /books/showPage/:numPage - пейджинг (get); /books/searchBook - поиск по подстроке (фильтрация по названию) (get, query запрос необходимые параметры: substring); /books - фильтрация по статусу (get, query запрос необходимые параметры: available);';

module.exports = (app, db) => { // методы post/get
	const dbName = db.db("library-omega"),
		  collectionBooking = dbName.collection("booking"),
		  collectionBook = dbName.collection("book");

	function isNumeric(num) {
		return !isNaN(parseFloat(num)) && isFinite(num);
	}

	function isInteger(num) {
		return (num ^ 0) === num;
	}

	function isset() {
		var a = arguments, l = a.length, i = 0;
		if (l === 0) {
			console.log('Empty isset');
		}

		while (i !== l) {
			if (typeof(a[i]) == 'undefined' || a[i] === null) {
				return false;
			} else {
				i++;
			}
		}

		return true;
	}

	app.get('/', (req, res, next) => {
		res.send(message);
		next();
	});

	app.post('/books', (req, res, next) => { // добавление книги
		if (!isset(req.body.name, req.body.link, req.body.authors, req.body.description, req.body.year))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (name, link, authors, description, year)"));

		let year_book = +req.body.year;

		if (!isNumeric(year_book) || !isInteger(year_book))
			return next(new errs.InvalidArgumentError("Year mast be numeric and integer"));

		let book = {
			name: req.body.name,
			link: req.body.link,
			authors: req.body.authors,
			available: true,
			description: req.body.description,
			year: year_book
		};

		collectionBook.insertOne(book, (err, result) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			console.log(result.ops);
		});

		let resBody = {
			code: 'Status ok',
			message: 'Book successfully added'
		};

		res.send(resBody);
		next();
	});

	app.get('/books/:id', (req, res, next) => { // получить информацию о книге по id
		// const book_id = req.params.id;
		if (!isset(req.params.id))
			return next(new errs.InvalidArgumentError("Not enough parameters: mast be (id)"));
		if (!ObjectID.isValid(req.params.id))
			return next(new errs.InvalidArgumentError("Incorrect id"));

		const idBook = ObjectID(req.params.id);

		let queryIdBook = {
			'_id': idBook
		}

		collectionBook.find(queryIdBook).toArray((err, info) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			if(info.length === 0)
				return next(new errs.InvalidArgumentError("Not found"));

			let query = {
				book_id: idBook
			};

			collectionBooking.find(query).sort({taken: -1}).toArray((err, result) => {
				if (err)
					return next(new errs.BadGatewayError(err.message));

				let bookInfo = {};
				bookInfo['book'] = info[0];
				bookInfo['lastBooking'] = result.length === 0 ? {} : result[0];

				res.send(bookInfo);
				next();
			});
		});
	});

	app.post('/booking', (req, res, next) => { // забронировать книгу
		if (!isset(req.body.id))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (id)"));
		if (!isset(req.body.name))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (name)"));
		if (!ObjectID.isValid(req.params.id))
			return next(new errs.InvalidArgumentError("Incorrect id"));

		const book_id = ObjectID(req.body.id);

		let queryIdBook = {
			'_id': book_id
		}

		collectionBook.find(queryIdBook).toArray((err, result) => {
			if (result.length === 0)
				return next(new errs.InvalidArgumentError("not found"));
			if (result[0]['available'] === false)
				return next(new errs.InvalidArgumentError("The book is already booked"));

			let booking = {
				book_id: book_id,
				user: req.body.name,
				taken: new Date(),
				returned: null
			};

			collectionBooking.insertOne(booking, (err) => {
				if (err)
					return next(new errs.BadGatewayError(err.message));
			});

			let query = {_id: book_id};
			let values = {$set: {available: false}};

			collectionBook.updateOne(query, values, (err) => {
				if (err)
					return next(new errs.BadGatewayError(err.message));

				let resBody = {
					code: 'Status ok',
					message: 'Book successfully booked'
				};

				res.send(resBody);
				next();
			});
		});
	});

	app.post('/cancelBooking', (req, res, next) => { //снять бронь
		if (!isset(req.body.id))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (id)"));
		if (!ObjectID.isValid(req.params.id))
			return next(new errs.InvalidArgumentError("Incorrect id"));

		const book_id = ObjectID(req.body.id);

		let query = {
			book_id: book_id
		};

		collectionBooking.find(query).sort({taken: -1}).toArray((err, result) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			if(result.length === 0)
				return next(new errs.InvalidArgumentError("Not found"));

			let info = result[0];
			if (info['returned'] !== null)
				return next(new errs.InvalidArgumentError("book is not booked"));

			let query = {_id: book_id};
			let values = {$set: {available: true}};

			collectionBook.updateOne(query, values, (err) => {
				if (err)
					return next(new errs.BadGatewayError(err.message));
			});

			let idBooking = result[0]._id;

			query = {_id: idBooking};
			values = {$set: {returned: new Date()}};

			collectionBooking.updateOne(query, values, (err) => {
				if (err)
					return next(new errs.BadGatewayError(err.message));
			});

			let resBody = {
				code: 'Status ok',
				message: 'Book was returned'
			};

			res.send(resBody);
			next();
		});
	});


	app.get('/books/showPage/:numPage', (req, res, next) => { // пейджинг
		if (!isset(req.params.numPage))
			return next(new errs.InvalidArgumentError("Not enough parameters: mast be (numPage)"));

		let numPage = +req.params.numPage;
		let countBook = 20;

		if (!isNumeric(numPage) || !isInteger(numPage))
			return next(new errs.InvalidArgumentError("Number page mast be numeric and integer"));
		if (numPage < 1)
			return next(new errs.InvalidArgumentError("Argument less 1"));

		collectionBook.find().limit(countBook).skip(countBook * (numPage - 1)).toArray((err, results) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			res.send(results);
			next();
		});
	});

	app.get('/books/searchBook', (req, res, next) => { // поиск по подстроке (фильтрация по названию)
		if (!isset(req.query.substring))
			return next(new errs.InvalidArgumentError("Not enough query parameters: mast be (substring)"));
		if (isEmpty(req.query.substring))
			return next(new errs.InvalidArgumentError("Substring is empty"));
		
		let substring = req.query.substring;
		let query = {
			"name": {$regex: substring}
		};

		collectionBook.find(query).toArray((err, result) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			res.send(result);
			next();
		});
	});

	app.get('/books', (req, res, next) => { // фильтрация по статусу
		if (!isset(req.query.available))
			return next(new errs.InvalidArgumentError("Not enough query parameters: mast be (available)"));

		let available = req.query.available;
		let isAvailable = (available === 'true'); // прости, но ты пишешь на javascript
		let query = (available ? {"available": isAvailable} : {});

		collectionBook.find(query).toArray((err, result) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			res.send(result);
			next();
		});
	});
};