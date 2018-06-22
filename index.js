// index.js
const mongoClient = require("mongodb").MongoClient;
const restify = require('restify');
const server = restify.createServer();
const serverPort = 3000;
const dbPort = 27017;

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

mongoClient.connect(`mongodb://localhost:${dbPort}`, function(err, database) { // Подключаемся к базе TODO..
	try {
		if (err) throw err;

		server.listen(serverPort, (err) => { // Подключаемся к серверу
			if (err) throw err;
			require('./app/routes')(server, database); // Модуль маршрутов
			console.log('Listening on port ' + serverPort);
		});

    	console.log("success connect to database");
	} catch(e) {
		console.log(e);
		res.send(e.message);
	}
    //database.close();
});