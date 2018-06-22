const ObjectID = require('mongodb').ObjectID;
module.exports = function (app, db) { // тест методов post/get
    const dbName = db.db("library");
    const collectionBooking = dbName.collection("booking");
    const collectionBook = dbName.collection("book");

    function isNumeric(num) {
		return !isNaN(parseFloat(num)) && isFinite(num);
	}

	function isInteger(num) {
		return (num ^ 0) === num;
	}

    app.post('/addBook', (req, res) => { // добавление книги
    	try {
    		let year_book = +req.body.year;
    		if (!isNumeric(year_book) || !isInteger(year_book)) throw new Error("year mast be numeric and integer");

    		let book = {
	            name: req.body.name,
	            link: req.body.link,
	            authors: req.body.author_name,
	            available: true,
	            description: req.body.description,
	            year: year_book
	        };

	        collectionBook.insertOne(book, function (err, result) {
	            if (err) throw err;
	            console.log(result.ops);
	        });

	        res.send("Book successfully added");
    	} catch(e) {
    		console.log(e);
    		res.send(e.message);
    	}
    });

    app.get('/books/:id', (req, res) => { // получить информацию о книге по id
    	try {
    		collectionBook.findOne({"_id": ObjectID(req.params.id)}, function (err, info) {
	            if (err) throw err;
	            res.send(info);
	        });
    	} catch(e) {
			console.log(e);
    		res.send(e.message);
    	}
    });

    app.post('/books/:id', (req, res) => { // забронировать книгу на 10 дней
    	try {
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
	            if (err) throw err;
	        });

	        let query = {_id: book_id};
	        let values = {$set: {available: false}};

	        collectionBook.updateOne(query, values, function (err) {
	            if (err) throw err;
	        });

	        res.send("Book successfully booked");
		} catch(e) {
			console.log(e);
    		res.send(e.message);
		}
    });


    app.get('/showPage/:numPage', (req, res) => { // пейджинг
    	try {
    		let numPage = +req.params.numPage;
    		let countPage = 20;
    		if (numPage < 1) throw new Error("argument less 1");

    		collectionBook.find().limit(countPage * numPage).toArray(function(err, results) {
    			if (err) throw err;
		        res.send(results);
		    });
    	} catch(e) {
    		console.log(e);
    		res.send(e.message);
    	}
    });

    app.get('/searchBook/:substring', (req, res) => { // поиск по подстроке (фильтрация по названию)
    	try {
    		let substring = req.params.substring;
	    	let query = { 
	    		"name": {$regex: substring} 
	    	};

	    	collectionBook.find(query).toArray(function(err, result) {
	    		if (err) throw err;
		        res.send(result);
		    });
		} catch(e) {
			console.log(e);
    		res.send(e.message);
		}
    });

    app.get('/book', (req, res) => { // фильтрация по статусу
    	try {
    		let available = req.query.available;
	    	let isAvailable = (available == 'true'); // прости, но ты пишешь на javascript 
	    	let query = (available ? {"available": isAvailable} : {});

	    	collectionBook.find(query).toArray(function(err, result) {
	    		if (err) throw err;
		        res.send(result);
		    });
		} catch(e) {
			console.log(e);
    		res.send(e.message);
		}
    });
};