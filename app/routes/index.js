var errs = require('restify-errors');
const ObjectID = require('mongodb').ObjectID;

let message = 'This library app. accept requests: /books - добавление книги (post, необходимые параметры в body: name, link, authors, description, year); /books/:id - получить информацию о книге по id (get) /booking - забронировать книгу или снять бронь (post, необходимые параметры в body: id, name, available); /books/showPage/:numPage - пейджинг (get); /books/searchBook - поиск по подстроке (фильтрация по названию) (get, query запрос необходимые параметры: substring); /books - фильтрация по статусу (get, query запрос необходимые параметры: available);';

module.exports = function (app, db) { // методы post/get
	const dbName = db.db("library-omega");
	const collectionBooking = dbName.collection("booking");
	const collectionBook = dbName.collection("book");

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

		collectionBook.insertOne(book, function (err, result) {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			console.log(result.ops);
		});

		res.send("Book successfully added");
	});

	app.get('/books/:id', (req, res, next) => { // получить информацию о книге по id
	   // const book_id = req.params.id;
		if (!isset(req.params.id))
			return next(new errs.InvalidArgumentError("Not enough parameters: mast be (id)"));

		try {
			const idBook = ObjectID(req.params.id);

            collectionBook.find({"_id": idBook}).toArray(function (err, info) {
                if (err)
                    return next(new errs.BadGatewayError(err.message));
                if(info.length === 0)
                    return next(new errs.InvalidArgumentError("Not found"));

                let query = {book_id: ObjectID(idBook)};

                collectionBooking.find(query).sort({taken: -1}).toArray(function (err, result) {
                    if (err)
                        return next(new errs.BadGatewayError(err.message));

					let bookInfo = {};
                    bookInfo['book'] = info[0];
                    bookInfo['lastBooking'] = result.length === 0 ? {} : result[0];

                    res.send(bookInfo);
                });
            });
		} catch(err) {
			return next(new errs.InvalidArgumentError(err.message));
		}
	});

	app.post('/booking', (req, res, next) => { // забронировать книгу

		if (!isset(req.body.id))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (id)"));
		if (!isset(req.body.name))
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (name)"));

		try {
			const book_id = ObjectID(req.body.id);
            collectionBook.find({"_id":  book_id}).toArray(function (err, result){
                if (result.length === 0)
                    return next(new errs.InvalidArgumentError("not found"));
                if (result[0]['available'] === false)
				{
                    return next(new errs.InvalidArgumentError("The book is already booked"));
				}

                let booking = {
                    book_id: book_id,
                    user: req.body.name,
                    taken: new Date(),
                    returned: null
                };

                collectionBooking.insertOne(booking, function (err) {
                    if (err)
                        return next(new errs.BadGatewayError(err.message));
                });

                let query = {_id: book_id};
                let values = {$set: {available: false}};

                collectionBook.updateOne(query, values, function (err) {
                    if (err)
                        return next(new errs.BadGatewayError(err.message));
                    res.send("Book successfully booked");
                });
            });
		} catch(err) {
			return next(new errs.InvalidArgumentError(err.message));
		}
	});

    app.post('/cancelBooking', (req, res, next) => { //снять бронь

        if (!isset(req.body.id))
            return next(new errs.InvalidArgumentError("Not enough body data: mast be (id)"));

        try {
            const book_id = ObjectID(req.body.id);

            let query = {book_id: book_id};

            collectionBooking.find(query).sort({taken: -1}).toArray(function (err, result) {
                if (err || result.length === 0)
                    return next(new errs.BadGatewayError(err.message));

                let info = result[0];
                if (info['returned'] !== null)
                    return next(new errs.InvalidArgumentError("book is not booked"));

                let query = {_id: book_id};
                let values = {$set: {available: true}};

                collectionBook.updateOne(query, values, function (err) {
                    if (err)
                        return next(new errs.BadGatewayError(err.message));
                });

                let idBooking = result[0]._id;

                query = {_id: idBooking};
                values = {$set: {returned: new Date()}};

                collectionBooking.updateOne(query, values, function (err) {
                    if (err)
                        return next(new errs.BadGatewayError(err.message));
                });

                res.send("Book was returned");
            });
        } catch(err) {
            return next(new errs.InvalidArgumentError(err.message));
        }
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

		collectionBook.find().limit(countBook).skip(countBook * (numPage - 1)).toArray(function (err, results) {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			res.send(results);
		});
	});

	app.get('/books/searchBook', (req, res, next) => { // поиск по подстроке (фильтрация по названию)
		if (!isset(req.query.substring))
			return next(new errs.InvalidArgumentError("Not enough query parameters: mast be (substring)"));

		let substring = req.query.substring;
		let query = {
			"name": {$regex: substring}
		};

		collectionBook.find(query).toArray(function (err, result) {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			res.send(result);
		});
	});

	app.get('/books', (req, res, next) => { // фильтрация по статусу
		if (!isset(req.query.available))
			return next(new errs.InvalidArgumentError("Not enough query parameters: mast be (available)"));

		let available = req.query.available;
		let isAvailable = (available === 'true'); // прости, но ты пишешь на javascript
		let query = (available ? {"available": isAvailable} : {});

		collectionBook.find(query).toArray(function (err, result) {
			if (err)
				return next(new errs.BadGatewayError(err.message));
			res.send(result);
		});
	});
};