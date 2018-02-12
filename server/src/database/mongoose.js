var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mongoUrl = process.env.MONGODB_URI;

mongoose.connect(mongoUrl, {
	useMongoClient: true,
});

var server = mongoose.connection;
server.on('error', console.error.bind(console, 'mongo connection error:'));
server.once('open', function() {
  // console.log(`Mongo started on port: ${mongoUrl}`);
});

module.exports = { mongoose, mongoUrl };
