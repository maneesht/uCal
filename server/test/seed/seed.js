const { ObjectID } = require('mongodb');

var { User } = require('./../../src/models/user');
var { Calendar } = require('./../../src/models/calendar');
var { Group } = require('./../../src/models/group');
var { UEvent } = require('./../../src/models/event');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const calendarOneId = new ObjectID();
const calendarTwoId = new ObjectID();
const eventOneId = new ObjectID();
const eventTwoId = new ObjectID();
const groupOneId = new ObjectID();
const groupTwoId = new ObjectID();

const users = [{
	_id: userOneId,
	email: 'eli@example.com',
	password: 'UserPassOne',
	groups: [
		groupOneId
	],
	groupinvites: [
		groupTwoId
	]
}, {
	_id: userTwoId,
	email: 'steve@example.com',
	password: 'UserPassTwo',
	groups: [
		groupTwoId
	]
}];

const calendars = [{
	_id: calendarOneId,
	name: "Test Calendar 1",
	description: "The description!",
	owner: userOneId,
	users: users[0]
}, {
	_id: calendarTwoId,
	name: "Test Calendar 2",
	description: "The description 2!",
	owner: userTwoId,
	users: users[1]
}];

const events = [{
	_id: eventOneId,
	name: "Test Event 1",
	date: { day: 1, month: 1, year: 2000 },
	allDay: false,
	startTime: { day: 1, month: 1, year: 2000, hour: 1, minute: 30 },
	endTime: { day: 1, month: 1, year: 2000, hour: 2, minute: 30 },
	location: { name: "HAAS" },
	description: "CS meeting",
	calendar: calendarOneId,
	invites: []
}, {
	_id: eventTwoId,
	name: "Test Event 2",
	date: { day: 2, month: 2, year: 2222 },
	allDay: false,
	startTime: { day: 2, month: 2, year: 2222, hour: 2, minute: 00 },
	endTime: { day: 2, month: 2, year: 2222, hour: 2, minute: 30 },
	location: { name: "Lawson" },
	description: "CS meeting",
	calendar: calendarOneId,
	invites: []
}];

const groups = [{
	_id: groupOneId,
	name: "Test Group 1",
	creator: userOneId,
	members: [userOneId]
}, {
	_id: groupTwoId,
	name: "Test Group 2",
	creator: userTwoId,
	members: [userTwoId]
}];

const populateUsers = (done) => {
	User.remove({}).then(() => {
		var userOne = new User(users[0]).save();
		var userTwo = new User(users[1]).save();

		return Promise.all([userOne, userTwo]);

	}).then(() => done());
};

const populateCalendars = (done) => {
	Calendar.remove({}).then(() => {
		var calendarOne = new Calendar(calendars[0]).save();
		var calendarTwo = new Calendar(calendars[1]).save();

		return Promise.all([calendarOne, calendarTwo]);

	}).then(() => done());
};

const populateEvents = (done) => {
	UEvent.remove({}).then(() => {
		var eventOne = new UEvent(events[0]).save();
		var eventTwo = new UEvent(events[1]).save();

		return Promise.all([eventOne, eventTwo]);

	}).then(() => done());
};

const populateGroups = (done) => {
	UEvent.remove({}).then(() => {
		var groupOne = new UEvent(groups[0]).save();
		var groupTwo = new UEvent(groups[1]).save();

		return Promise.all([groupOne, groupTwo]);

	}).then(() => done());
};

module.exports = { users, calendars, events, groups, populateUsers, populateCalendars, populateEvents, populateGroups };