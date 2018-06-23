// index.js
var errs = require('restify-errors');
const mongoClient = require("mongodb").MongoClient;
const restify = require('restify');
const server = restify.createServer();
const serverPort = 3000;

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

mongoClient.connect(`mongodb://admin:password1@ds263660.mlab.com:63660/library-omega`, function(err, database) { // Подключаемся к базе TODO..
	if (err) return console.log(err);

	server.listen(serverPort, (err) => { // Подключаемся к серверу
		if (err) return console.log(err);
		require('./app/routes')(server, database); // Модуль маршрутов
		console.log('Listening on port ' + serverPort);
	});

	console.log("success connect to database");
	//database.close();
});