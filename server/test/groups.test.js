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

	//normally accept an invite to a group
	it('should accept an invite', (done) => {

		var accept = true;

		request(app)
			.patch(`/user/${users[0]._id}/groups/${groups[1]._id}/accept`)
			.send({accept})
			.expect(200)
			.expect((res) => {
				expect(res.text).toBe("User added to group");
			})
			.end(done);
	});

	//normally declinde an invite to a group
	it('should decline an invite', (done) => {

		var accept = false;

		request(app)
			.patch(`/user/${users[0]._id}/groups/${groups[1]._id}/accept`)
			.send({accept})
			.expect(200)
			.expect((res) => {
				expect(res.text).toBe("User succesfully declined invitation to group");
			})
			.end(done);
	});

	//try accepting for a group that doesn't exists
	it('should return 400 because the group doesn\'t exist', (done) => {

		var accept = true;

		request(app)
			.patch(`/user/${users[0]._id}/groups/5784852/accept`)
			.send({accept})
			.expect(400)
			.end(done);
	});

	//try accepting for a user that doesn't exists
	it('should return 400 because the user doesn\'t exist', (done) => {

		var accept = true;

		request(app)
			.patch(`/user/2424112/groups/${groups[1]._id}/accept`)
			.send({accept})
			.expect(400)
			.end(done);
	});

	//TODO try accepting for a group that doesn't exists

	//TODO try doing something other than accepting/declining

	//TODO try sending something other than true or false

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
