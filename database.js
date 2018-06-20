const mongoClient = require("mongodb").MongoClient;
const dbPort = 27017;
var db; // Ссылка на базу

mongoClient.connect(`mongodb://localhost:${dbPort}/lib`, function(err, database) { // Подключаемся к базе TODO..
    if(err) {
        return console.log(err);
    }
    db = database; // Сохраняем ссылку на базу
    console.log("success");
    database.close();
});