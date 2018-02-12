const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const  app = require('./../server');
var { User } = require('./../src/models/user');
var { Calendar } = require('./../src/models/calendar');
var { Group } = require('./../src/models/group');
var { Evento } = require('./../src/models/event');
const { users, calendars, events, groups, populateUsers, populateCalendars, populateEvents, populateGroups } = require('./seed/seed');
require("supertest").agent(app.listen());

beforeEach(populateUsers);
beforeEach(populateCalendars);
beforeEach(populateEvents);
beforeEach(populateGroups);

describe('GROUP TESTS', () => {

//test accepting and declining a group invite
describe('PATCH /user/:userId/groups/:groupID/accept', () => {

	//TODO normally accept an invite to a group
	it('should accept an invite', (done) => {

		request(app)
			.post(`/users/${users[0]._id}/calendars`)
			.send(calendar)
			.expect(200)
			.expect((res) => {
				expect(res.body.name).toBe(name);
				expect(res.body.description).toBe(description);
				expect(res.body.owner).toBe(users[0]._id.toHexString());
				expect(res.body.users[0]).toBe(users[0]._id.toHexString());
				//also group is?
				//also events is?
				//check that the calendar was added to the user's list of calendars
			})
			.end(done);
	});

	//TODO normally declinde an invite to a group

	//TODO try accepting for a group that doesn't exists

	//TODO try accepting for a user that doesn't exists

	//TODO try accepting for a group that doesn't exists

	//TODO try doing something other than accepting/declining

});

//test inviting users to a group
describe('PATCH /groups/:groupID/invite', () => {

	//TODO invite a user normally

	//TODO invite a user that doesn't exist

	//TODO invite a user to a group that doesn't exist


});

//test creating a new group
describe('POST /user/:userID/groups', () => {

	//TODO create a group normally

	//TODO create a group for a user that doesn't exist

	//TODO try to create a group without a group name

	//TODO try to create a group without inviting people

	//TODO try to create a group inviting people that don't exist

});

//test removing a user from a group
describe('DELETE /users/:userID/groups/:groupID', () => {

	//TODO try to remove a user from a group normally

	//TODO try to remove a user from a group that doesn't exist

	//TODO try to remove a user that doesn't exist from a group

	//TODO try to remove a user that is not a member of the group from the group 

});

//test getting a group
describe('GET /groups/:groupId', () => {

	//TODO try getting a group normally

	//TODO try getting a group that doesn't exist

});



});
