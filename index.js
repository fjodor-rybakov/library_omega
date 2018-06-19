// index.js
const restify = require('restify');
const mongoClient = require("mongodb").MongoClient;
const server = restify.createServer();
const serverPort = 3000;
const dbPort = 27017;
var db; // Ссылка на базу

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

require('./app/routes')(server, {}); // Модуль маршрутов

mongoClient.connect(`mongodb://localhost:${dbPort}/lib`, function(err, database) { // Подключаемся к базе TODO..
    if(err) {
        return console.log(err);
    }

    db = database; // Сохраняем ссылку на базу
    server.listen(serverPort, (err) => { // Подключаемся к серверу 
		console.log('Listening on port ' + serverPort);
	});

    database.close();
});