// index.js
var restify = require('restify');
var server = restify.createServer();

server.listen(3000, function() {
    console.log('Listening on port 3000');
});

server.get('/', function (req, res, next) {
   res.send("Hello!");
   next();
});