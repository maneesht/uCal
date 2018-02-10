const { ObjectID } = require('mongodb');

var { User } = require('./../../src/models/user');
var { Calendar } = require('./../../src/models/calendar');
var { Group } = require('./../../src/models/group');
var { Evento } = require('./../../src/models/event');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
	_id: userOneId,
	email: 'eli@example.com',
	password: 'UserPassOne'
}, {
	_id: userTwoId,
	email: 'steve@example.com',
	password: 'UserPassTwo'
}];


const populateUsers = (done) => {
	User.remove({}).then(() => {
		var userOne = new User(users[0]).save();
		var userTwo = new User(users[1]).save();

		return Promise.all([userOne, userTwo]);

	}).then(() => done());
};


module.exports = { users, populateUsers };