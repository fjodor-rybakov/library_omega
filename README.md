# library_omega
library omega practice

•	Post-запрос на бронирование: /booking
в теле запроса должны быть поля: 
id - id книги
name - имя пользователя 

•	Post-запрос на снятие брони: /cancelBooking
поле только одно - id

•	Get-запрос на инфу о книге:  /books/:id
вы получаете объект с полями:
book - хранит всю инфу о книге;
lastBooking - инфа о последнем бронировании этой книги; если не было ни одного бронирования, то будет пустой объект

Пример:
{

    "book": {
        "_id": "5b39038651c1b60d14738c79",
        "name": "Убить пересмешника",
        "link": "https://www.ozon.ru/context/detail/id/26357878/",
        "authors": "Харпер Ли",
        "available": true,
        "description": "Пронзительная история семьи, живущей в вымышленном маленьком городке на юге Америки, в штате Алабама…",
        "year": 1960
    },
    
    "lastBooking": {
        "_id": "5b390baa7929ff1a585c4f50",
        "book_id": "5b39038651c1b60d14738c79",
        "user": "Иванов И.",
        "taken": "2018-07-01T17:13:14.898Z",
        "returned": "2018-07-01T17:14:36.720Z"
    }
    
    "lastBooking": {} - если ни одного бронирования не было
    
}

•	Post-запрос на добавление книги: '/books' 
в теле запроса должны быть поля: 
name – название книги,
link – ссылка на магазин, 
authors – авторы (если несколько, то просто через запятую в одном поле), description – описание, 
year – год написания

•	Get-запрос на получение массива книг (20 книг на одной странице, numPage - номер страницы): /books/showPage/:numPage
получаете массив объектов:     
[  {

      "_id": "5b39038651c1b60d14738c79",
      "name": "Убить пересмешника",
      "link": "https://www.ozon.ru/context/detail/id/26357878/",
      "authors": "Харпер Ли",
      "available": true,
      "description": "Пронзительная история семьи, живущей в вымышленном маленьком городке на юге Америки, в штате Алабама…",
      "year": 1960
      
}, …]

•	Get-запрос /books/searchBook - поиск по подстроке (фильтрация по названию) 
query запрос; необходимые параметры: substring; 

•	Get-запрос /books - фильтрация по статусу 
query запрос; необходимые параметры: available

•	Post-запрос /book/delete - удаление одной книги
в теле запроса должны быть поля: 
id - id книги

Необходимые команды для установки node_modules

npm install —global —production windows-build-tools :пакеты vs

npm install —global node-gyp :аддон

npm install restify :фреймворк для node.js

npm install mongodb —save :бд 

npm install —save-dev mocha :тесты

npm install —save-dev supertest :тесты
