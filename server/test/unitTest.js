var request = require("request");
var assert = require('assert');
var base_url = "http://localhost:3000/";
var app = require("../server.js");
const { mongoose, mongoUrl } = require('.././src/database/mongoose');
const { User } = require('.././src/models/user');

var dummy = new User({ username: "admin2", password: "password2", email: "admin2@test.edu" });

describe("Simple test", function () {

  before(function (done) {
    //mongoose.connect();
    const db = mongoose.createConnection('mongodb://localhost/data');
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function () {
      console.log('We are connected to test database!');
      done();
    });
  });

  it('New user saved to test database', function (done) {
    dummy.save((function (err, dummy) {
      if (err) return console.error(err);
    }));
  });

  it('Should retrieve data from test database', function (done) {
    User.find({ username: 'admin2' }, (err, username) => {
      if (err) { throw err; }
      if (username.length === 0) { throw new Error('No data!'); }
      done();
    });
  });


  //After all tests are finished drop database and close connection
  after(function (done) {
    mongoose.connection.db.dropDatabase(function () {
      mongoose.connection.close(done);
    });
  });
});

