module.exports = function(app, db) { // тест методов post/get
	app.post('/notes', (req, res) => {
    	res.send(req.method);
	});

	app.get('/', (req, res) => {
    	res.send(req.method);
	});
};