var supertest = require('supertest');
var assert = require('assert');
var app = require('../index');

/*
var s;
s = app.listen(function() {
		var url = 'http://localhost:' + s.address().port;
		console.log(url);
	});
*/

/*describe('addBook', function() {
	it('mustAdd', function(done) {
		app.listen(function() {
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
		app.listen(function() {
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
});*/

/*describe('paging books', function () {
	it('paging', function (done) {
		app.listen(function() {
			var url = 'http://localhost:' + 3000;
			supertest(url)
			.get('/books/showPage/1')
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

describe('search substring books', function() {
	it('search substring', function(done) {
		app.listen(function() {
			var url = 'http://localhost:' + 3000;
			supertest(url)
			.get('/books/searchBook')
			.query({ substring: 'new' })
			.expect('Content-Type', /json/)
			.expect(200, function (err,res) {
				console.log(err);
				console.log(JSON.stringify(res));
				if (err) throw err;
				done();
			});
		});
	});
});

describe('filter status books', function() {
	it('filter status', function(done) {
		app.listen(function() {
			var url = 'http://localhost:' + 3000;
			supertest(url)
			.get('/books')
			.query({ available: true })
			.expect('Content-Type', /json/)
			.expect(200, function (err,res) {
				console.log(err);
				console.log(JSON.stringify(res));
				if (err) throw err;
				done();
			});
		});
	});
});*/


describe('booking', function () {
    var url = 'http://localhost:' + 3000;

    it('getInfoInJSON', function (done) {
        app.listen(function() {
            supertest(url)
                .post('/books/5b2e8855a227d821587fb894')
                .send({name: 'john'})
                .expect(200, function (err,res) {
                    console.log(err);
                    console.log(JSON.stringify(res));
                    if (err) throw err;
                    done();
                });
        });
    });

    it('checkBooking', function (done) {
        app.listen(function() {
            supertest(url)
                .get('/books/5b2e8855a227d821587fb894')
                .expect('Content-Type', /json/)
                .expect(200, function (err,res) {
                    var data = JSON.parse(res.text);
                    //console.log(data.available);
                    console.log(err);
                    console.log(JSON.stringify(res));
                    if (err) throw err;
                    assert.strictEqual(data.available, false);
                    done();
                })
        })
    })
});