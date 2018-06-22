const ObjectID = require('mongodb').ObjectID;
module.exports = function (app, db) { // тест методов post/get
    const dbName = db.db("library");
    const collectionBooking = dbName.collection("booking");
    const collectionBook = dbName.collection("book");

    app.post('/addBook', (req, res) => { // добавление книги
        let book = {
            name: req.body.name,
            link: req.body.link,
            authors: req.body.author_name,
            available: true,
            description: req.body.description,
            year: +req.body.year
        };

        collectionBook.insertOne(book, function (err, result) {
            if (err) {
                res.send(err);
            }
            console.log(result.ops);
        });

        res.send("Book successfully added");
    });

    app.get('/books/:id', (req, res) => { // получить информауию о книге по id
        collectionBook.findOne({"_id": ObjectID(req.params.id)}, function (err, info) {
            if (err) {
                console.log(err);
                res.send(err);
            }

            res.send(info);
        });
    });

    app.post('/books/:id', (req, res) => { // забронировать книгу на 10 дней
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
            if (err) {
                res.send(err);
            }
        });

        let query = {_id: book_id};
        let values = {$set: {available: false}};

        collectionBook.updateOne(query, values, function (err) {
            if (err) {
                res.send(err);
            }
        });

        res.send("Book successfully booked");
    });


    app.post('/showPage/:numPage', (req, res) => {
    	let numPage = +req.params.numPage;
    	let countPage = 20;

    	collectionBook.find().limit(countPage * numPage).toArray(function(err, results) {
    		if (err) {
                res.send(err);
            }

	        res.send(results);
	    });
    });

};

