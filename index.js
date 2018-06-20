// index.js
const restify = require('restify');
const db = require('./database');
const server = restify.createServer();
const serverPort = 3000;

server.listen(serverPort, (err) => { // Подключаемся к серверу
    console.log('Listening on port ' + serverPort);
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

require('./app/routes')(server, {}); // Модуль маршрутов
