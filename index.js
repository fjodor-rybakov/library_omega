// index.js
const config  = require('./config'), 
	  restify = require('restify'),
	  errs = require('restify-errors'),
	  mongoClient = require("mongodb").MongoClient;

const server = restify.createServer({
	name: config.name,
    version: config.version
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('*/', restify.plugins.serveStatic({
    directory: 'C:/library_omega_site/public',
    default: 'index.html'
}));

server.listen(config.port, () => { // Подключаемся к серверу
	console.log(`Server is listening on port ${config.port}`);
});

server.on('restifyError', (req, res, err, callback) => { // Обработка ошибок сервера
	return callback();
});

mongoClient.connect(config.db.uri, (err, database) => { // Подключаемся к базе
	if (err) {
		console.log(err);
		process.exit(1);
	}

	require('./app/routes')(server, database); // Модуль маршрутов
	console.log(`Success connect to database`);
});