var supertest = require('supertest');
var assert = require('assert');
var app = require('../index');
var s;

/*s = app.listen(function() {
        var url = 'http://localhost:' + s.address().port;
        console.log(url);
        });*/

describe('addBook', function() {
    it('mustAdd', function(done) {
    	s = app.listen(function() {
	        var url = 'http://localhost:' + 3000;
	        supertest(url)
	            .post('/addBook')
	            .send({name: 'john',
	                link: 'link',
	                authors: 'author_name',
	                description: 'description',
	                year: 2000})
	            .set('Content-Type', 'application/json')
		      	.set('Accept', 'application/json')
	            .expect(200, function(err,result) {
		            console.log(err);
		            console.log(JSON.stringify(result));
		            if (err) throw err;
		            done();
		        });
        });
    });


});

describe('bookInfo', function () {
    it('getInfoInJSON', function (done) {
    	s = app.listen(function() {
	        var url = 'http://localhost:' + 3000;
	        supertest(url)
	            .get('/books/5b2e32f9fb6fc048e105b472')
	            .expect('Content-Type', /json/)
	            .expect(200, function (err,res) {
	            	console.log(err);
	            	console.log(JSON.stringify(res));
	                if (err) throw err;
	                done();
	            });
        });
    })
});