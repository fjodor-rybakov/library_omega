const ObjectID = require('mongodb').ObjectID;
module.exports = function (app, db) { // тест методов post/get
    const dbName = db.db("library");

    app.post('/addBook', (req, res) => {
        const collection = dbName.collection("book");

        let book = {
            name: req.body.name,
            link: req.body.link,
            authors: [{name: req.body.author_name, surname: req.body.author_surname}],
            available: true,
            description: req.body.description,
            year: req.body.year
        };

        collection.insertOne(book, function (err, result) {
            if (err) {
                res.send(err);
            }
            console.log(result.ops);
        });

        res.send(req.method);
    });

    app.get('/books/:id', (req, res) => { //получить информауию о книге по id
        dbName.collection("book").findOne({"_id": ObjectID(req.params.id)}, function (err, info) {
            if (err) {
                console.log(err);
                res.send(err)
            }
            res.send(info);
        });
    });

    app.post('/books/:id', (req, res) => { //забронировать книгу на 10 дней

        const ms = 86400000;
        const book_id = ObjectID(req.params.id);
        let date = new Date();

        let booking = {
            book_id: book_id,
            user: req.body.name,
            taken: date,
            returned: new Date(date.getTime() + ms * 10)
        };

        dbName.collection("booking").insertOne(booking, function (err) {
            if (err) {
                res.send(err);
            }
        });

        let query = {_id: book_id};
        let values = {$set: {available: false}};

        dbName.collection("book").updateOne(query, values, function (err) {
            if (err) {
                res.send(err);
            }
        });

        res.send(req.method);
    });

    app.get('/', (req, res) => {
        res.send(req.method);
    });

};

