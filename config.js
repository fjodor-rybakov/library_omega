module.exports = {
	name: 'library omega',
	version: '0.0.1',
	port: process.env.PORT || 3000,
	db: {
        uri: `mongodb://admin:password1@ds263660.mlab.com:63660/library-omega`,
    }
}