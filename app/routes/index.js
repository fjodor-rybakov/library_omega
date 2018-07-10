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

	function isEmpty(str) {
		return (!(isNumeric(str) && isInteger(str)) ? str.trim() == '' : str);
	}

	function isset() {
		var a = arguments, l = a.length, i = 0;
		if (l === 0) {
			console.log('Empty isset');
		}

		while (i !== l) {
			if (typeof(a[i]) == 'undefined' || a[i] === null || isEmpty(a[i])) {
				return false;
			} else {
				i++;
			}
		}

		return true;
	}

	app.post('/books', (req, res, next) => { // добавление книги
		if (!isset(req.body.name, req.body.link, req.body.authors, req.body.description, req.body.year))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (name, link, authors, description, year). All fields must are filled"));

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

		if (!isset(req.params.id))
			return next(new errs.InvalidArgumentError("Not enough parameters: mast be (id)"));
		if (!ObjectID.isValid(req.params.id))
			return next(new errs.InvalidArgumentError("Incorrect id"));

		const book_id = ObjectID(req.params.id);

		let query = {
			'_id': book_id
		};

		collectionBook.find(query).toArray((err, info) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			if(info.length === 0)
				return next(new errs.NotFoundError("Book not found"));

			query = {
				book_id: book_id
			};

			collectionBooking.find(query).sort({taken: -1}).toArray((err, result) => {
				if (err)
					return next(new errs.BadGatewayError(err.message));

				let bookInfo = {
                    "book": info[0],
                    "lastBooking": result.length === 0 ? {} : result[0]
                };

				res.send(bookInfo);
				next();
			});
		});
	});

	app.post('/booking', (req, res, next) => { // забронировать книгу
		if (!isset(req.body.id, req.body.name))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (id, name). All fields must are filled"));
		if (!ObjectID.isValid(req.body.id))
			return next(new errs.InvalidArgumentError("Incorrect id"));

		const book_id = ObjectID(req.body.id);

		let query = {
			'_id': book_id
		};

		collectionBook.find(query).toArray((err, result) => {
			if (result.length === 0)
				return next(new errs.NotFoundError("book not found"));
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
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (id). All fields must are filled"));
		if (!ObjectID.isValid(req.body.id))
			return next(new errs.InvalidArgumentError("Incorrect id"));

		const book_id = ObjectID(req.body.id);

		let query = {
			book_id: book_id
		};

		collectionBooking.find(query).sort({taken: -1}).toArray((err, result) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			if(result.length === 0)
				return next(new errs.NotFoundError("Book not found"));

			let info = result[0];
			if (info['returned'] !== null)
				return next(new errs.InvalidArgumentError("Book is not booked"));

			let query = {_id: book_id};
			let values = {$set: {available: true}};

			collectionBook.updateOne(query, values, (err) => {
				if (err)
					return next(new errs.BadGatewayError(err.message));
			});

			let booking_id = result[0]._id;

			query = {_id: booking_id};
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
			return next(new errs.InvalidArgumentError("Not enough query parameters: mast be (substring). All fields must are filled"));

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
			return next(new errs.InvalidArgumentError("Not enough query parameters: mast be (available). All fields must are filled"));

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

	app.post('/books/delete', (req, res, next) => { // Удаление книги
		if (!isset(req.body.id))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (id). All fields must are filled"));
		if (!ObjectID.isValid(req.body.id))
			return next(new errs.InvalidArgumentError("Incorrect id"));

		const book_id = ObjectID(req.body.id);
		let query = {
			_id: book_id
		};

		collectionBook.deleteOne(query, (err, result) => {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			if (result.result.n == 0) 
				return next(new errs.NotFoundError("Book not found"));

			let resBody = {
				code: 'Status ok',
				message: 'One book deleted'
			};

			res.send(resBody);
			next();
		});
	});

    app.post('/books/edit', (req, res, next) => { // Изменение книги

        function edit(query, values) {
            collectionBook.updateOne(query, values, (err) => {
                if (err)
                    return next(new errs.BadGatewayError(err.message));
            });
        }

        if (!isset(req.body.id))
            return next(new errs.InvalidArgumentError("Not enough body data: mast be (id). All fields must are filled"));
        if (!ObjectID.isValid(req.body.id))
            return next(new errs.InvalidArgumentError("Incorrect id"));

        const book_id = ObjectID(req.body.id);

        let name = isset(req.body.name) ? req.body.name : '';
        let link = isset(req.body.link) ? req.body.link : '';
        let description = isset(req.body.description) ? req.body.description : '';
        let authors = isset(req.body.authors) ? req.body.authors : '';

        let query = {_id: book_id};

        if(isset(req.body.year)){
            let year =  +req.body.year;
            if (!isNumeric(year) || !isInteger(year))
                return next(new errs.InvalidArgumentError("Year mast be numeric and integer"));
            let values = {$set: {year: year}};
            edit(query, values);
        }

        if (name !== '') {
            let values = {$set: {name: name}};
            edit(query, values);
        }

        if (link !== '') {
            let values = {$set: {link: link}};
            edit(query, values);
        }

        if (description !== '') {
            let values = {$set: {description: description}};
            edit(query, values);
        }

        if (authors !== '') {
            let values = {$set: {authors: authors}};
            edit(query, values);
        }

        let resBody = {
            code: 'Status ok',
            message: 'The book was edited'
        };

        res.send(resBody);
        next();
    });
};