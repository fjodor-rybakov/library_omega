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

        collectionBook.find({"_id": ObjectID(req.params.id)}).toArray( function (err, info) {
            if (err)
                return next(new errs.BadGatewayError(err.message));
            let query = {book_id: ObjectID(req.params.id)};

            collectionBooking.find(query).sort({taken: -1}).toArray(function (err, result) {
                if (err || result.length === 0)
                    return next(new errs.BadGatewayError(err.message));
                res.send(info.concat(result[0]));
            });
        });
    });

    app.post('/booking', (req, res, next) => { // забронировать книгу или снять бронь

        if (!isset(req.body.id))
            return next(new errs.InvalidArgumentError("Not enough body data: mast be (id)"));
        if (!isset(req.body.name))
            return next(new errs.InvalidArgumentError("Not enough body data: mast be (name)"));
        if (!isset(req.body.available))
            return next(new errs.InvalidArgumentError("Not enough body data: mast be (available)"));

        const book_id = ObjectID(req.body.id);
        let date = new Date();

        if (req.body.available === 'true') //забронировать
        {
            let booking = {
                book_id: book_id,
                user: req.body.name,
                taken: date,
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
            });

            res.send("Book successfully booked");

        } else { // снять бронь

            let query = {$and: [{book_id: book_id}, {user: req.body.name}]};

            collectionBooking.find(query).sort({taken: -1}).toArray(function (err, result) {
                if (err || result.length === 0)
                    return next(new errs.BadGatewayError(err.message));

                let query = {_id: book_id};
                let values = {$set: {available: true}};

                collectionBook.updateOne(query, values, function (err) {
                    if (err)
                        return next(new errs.BadGatewayError(err.message));
                });

                let idBooking = result[0]._id;

                query = {_id: idBooking};
                values = {$set: {returned: date}};

                collectionBooking.updateOne(query, values, function (err) {
                    if (err)
                        return next(new errs.BadGatewayError(err.message));
                });

                res.send("Book was returned");
            });
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