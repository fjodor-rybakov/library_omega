var errs = require('restify-errors');
const ObjectID = require('mongodb').ObjectID;

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

    app.post('/addBook', (req, res, next) => { // добавление книги
		if (!isset(req.body.name, req.body.link, req.body.author_name, req.body.description, req.body.year)) 
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (name, link, author_namem description, year)"));

		let year_book = +req.body.year;

		if (!isNumeric(year_book) || !isInteger(year_book)) 
			return next(new errs.InvalidArgumentError("Year mast be numeric and integer"));

		let book = {
            name: req.body.name,
            link: req.body.link,
            authors: req.body.author_name,
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
		if (!isset(req.params.id)) 
			return next(new errs.InvalidArgumentError("Not enough parameters: mast be (id)"));

		collectionBook.findOne({"_id": ObjectID(req.params.id)}, function (err, info) {
            if (err) 
            	return next(new errs.BadGatewayError(err.message));
            res.send(info);
        });
    });

    app.post('/books/:id', (req, res, next) => { // забронировать книгу на 10 дней
		if (!isset(req.params.id)) 
			return next(new errs.InvalidArgumentError("Not enough parameters: mast be (id)"));
		if (!isset(req.body.name)) 
			return next(new errs.InvalidArgumentError("Not enough body data: mast be (name)"));

		const ms = 86400000;
        const book_id = ObjectID(req.params.id);
        let date = new Date();

        let booking = {
            book_id: book_id,
            user: req.body.name,
            taken: date,
            returned: new Date(date.getTime() + ms * 10)
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
        });

        res.send("Book successfully booked");
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

		collectionBook.find().limit(countBook).skip(countBook * (numPage - 1)).toArray(function(err, results) {
			if (err) 
				return next(new errs.BadGatewayError(err.message));
	        res.send(results);
	    });
    });

    app.get('/books/searchBook/:substring', (req, res, next) => { // поиск по подстроке (фильтрация по названию)
		if (!isset(req.params.substring)) 
			return next(new errs.InvalidArgumentError("Not enough parameters: mast be (substring)"));

		let substring = req.params.substring;
    	let query = { 
    		"name": {$regex: substring} 
    	};

    	collectionBook.find(query).toArray(function(err, result) {
    		if (err) 
    			return next(new errs.BadGatewayError(err.message));
	        res.send(result);
	    });
    });

    app.get('/book', (req, res, next) => { // фильтрация по статусу
		if (!isset(req.query.available)) 
			return next(new errs.InvalidArgumentError("Not enough query parameters: mast be (available)"));

		let available = req.query.available;
    	let isAvailable = (available == 'true'); // прости, но ты пишешь на javascript 
    	let query = (available ? {"available": isAvailable} : {});

    	collectionBook.find(query).toArray(function(err, result) {
    		if (err) 
    			return next(new errs.BadGatewayError(err.message));
	        res.send(result);
	    });
    });
};