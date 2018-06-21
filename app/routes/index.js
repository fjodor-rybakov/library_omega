module.exports = function(app, db) { // тест методов post/get
    const dbName = db.db("library");

	app.post('/addBook', (req, res) => {
        const collection = dbName.collection("book");

        let book = {
            name: req.body.name,
            link: req.body.link,
            authors: [{name: req.body.author_name, surname: req.body.author_surname}],
            available:  req.body.available,
            description:  req.body.description,
            year: req.body.year
        };

        collection.insertOne(book, function(err, result){
            if(err){
                res.send(err);
            }
            console.log(result.ops);
        });

    	res.send(req.method);
	});

	app.get('/', (req, res) => {
    	res.send(req.method);
	});

	//console.log(db);
};

