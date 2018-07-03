var supertest = require('supertest');
var assert = require('assert');
//var app = require('../index');

//var url = 'https://libraryomega.herokuapp.com';
var url = 'localhost:3000';
/*
var s;
s = app.listen(function() {
		var url = 'http://localhost:' + s.address().port;
		console.log(url);
	});
*/

describe('add book', function () {
    it('mustAdd', function (done) {
        supertest(url)
            .post('/books')
            .send({
                name: 'john',
                link: 'link',
                authors: 'author_name',
                description: 'description',
                year: 2000
            })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200, function (err, result) {
                if (err) {
                    console.log(err);
                    console.log(JSON.stringify(res));
                    throw err;
                }
                done();
            });
    });
});

/*describe('get book info', function () {
	it('getInfoInJSON', function (done) {
			supertest(url)
			.get('/books/5b39040051c1b60d14738c7a')
			.expect('Content-Type', /json/)
			.expect(200, function (err,res) {
				if (err) {
					console.log(err);
					console.log(JSON.stringify(res));
					throw err;
				}
				done();
			});
	})
});

describe('paging books', function () {
	it('paging', function (done) {
			supertest(url)
			.get('/books/showPage/1')
			.expect('Content-Type', /json/)
			.expect(200, function (err,res) {
				if (err) {
					console.log(err);
					console.log(JSON.stringify(res));
					throw err;
				}
				done();
			});
	})
});

describe('search substring books', function() {
	it('search substring', function(done) {
			supertest(url)
			.get('/books/searchBook')
			.query({ substring: 'Б' })
			.expect('Content-Type', /json/)
			.expect(200, function (err,res) {
				if (err) {
					console.log(err);
					console.log(JSON.stringify(res));
					throw err;
				}
				done();
			});
	});
});

describe('filter status books', function() {
	it('filter status', function(done) {
			supertest(url)
			.get('/books')
			.query({ available: true })
			.expect('Content-Type', /json/)
			.expect(200, function (err,res) {
				if (err) {
					console.log(err);
					console.log(JSON.stringify(res));
					throw err;
				}
				done();
			});
	});
});*/

describe('booking', function () {
    it('getInfoInJSON', function (done) {
        supertest(url)
            .post('/booking')
            .send({
                name: "john",
                id: "5b39038651c1b60d14738c79"
            })
            .expect(200, function (err, res) {
                if (err) {
                    console.log(err);
                    console.log(JSON.stringify(res));
                    throw err;
                }
                done();
            });
    });

    it('checkBooking', function (done) {
        supertest(url)
            .get('/books/5b39038651c1b60d14738c79')
            .expect('Content-Type', /json/)
            .expect(200, function (err, res) {
                var data = JSON.parse(res.text);
                if (err) {
                    console.log(err);
                    console.log(JSON.stringify(res));
                    throw err;
                }
                assert.strictEqual(data.book.available, false);
                done();
            });
    });

});

describe('canbooking', function () {
    it('cancelBooking', function (done) {
        supertest(url)
            .post('/cancelBooking')
            .send({
                id: "5b39038651c1b60d14738c79"
            })
            .expect(200, function (err, res) {
                //  var data = JSON.parse(res);
                if (err) {
                    console.log(err);
                    console.log(JSON.stringify(res));
                    throw err;
                }
                done();
            })
    })
});
