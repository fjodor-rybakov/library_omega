var supertest = require('supertest');
var app = require('../index');
/*
describe('addBook', function() {
    it('mustAdd', function(done) {
        supertest(app)
            .post('/addBook')
            .send({name: 'john',
                link: 'link',
                authors: 'author_name',
                description: 'description',
                year: '2000'})
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });
});*/

describe('bookInfo', function () {
    it('getInfoInJSON', function (done) {
        supertest(app)
            .get('/books/5b2e32f9fb6fc048e105b472')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err,res) {
                if (err) throw err;
            });
        done();
    })
});