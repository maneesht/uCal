const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const  app = require('./../server');
var { User } = require('./../src/models/user');
var { Calendar } = require('./../src/models/calendar');
var { Group } = require('./../src/models/group');
var { UEvent } = require('./../src/models/event');
const { users, populateUsers } = require('./seed/seed');
require("supertest").agent(app.listen());
beforeEach(populateUsers);

describe.skip('FRIEND TESTS', () => {

describe('POST /users/:userID/friends/:friendID', () => {
    it('should return a success', (done) => {
        request(app)
            .post(`/users/${users[0]._id}/friends/${users[1]._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual("Friend request sent");
            })
            .end(done);
    });

    it('should return a 404 since the user does not exist', (done) => {
        request(app)
            .post(`/users/${users[0]._id}/friends/fakeID`)
            .expect(404)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual("User not Found");
            })
            .end(done);
    });
});

describe('PATCH /users/:userID/friends/:friendID', () => {
    it('should accept the friend request', (done) => {
        request(app)
            .post(`/users/${users[0]._id}/friends/${users[1]._id}`)
            .expect(200)
            .end(() => {
                request(app)
                    .patch(`/users/${users[1]._id}/friends/${users[0]._id}`)
                    .send({
                        accept: true
                    })
                    .expect(200)
                    .expect((res) => {
                        expect(res.text).toExist;
                        expect(res.text).toEqual("Friend Request Accepted");
                    })
                    .end(done);
            });
    });

    it('should decline the friend request', (done) => {
        request(app)
            .post(`/users/${users[0]._id}/friends/${users[1]._id}`)
            .expect(200)
            .end(() => {
                request(app)
                    .patch(`/users/${users[1]._id}/friends/${users[0]._id}`)
                    .send({
                        accept: false
                    })
                    .expect(200)
                    .expect((res) => {
                        expect(res.text).toExist;
                        expect(res.text).toEqual("Successfully declined friend request");
                    })
                    .end(done);
            });
    });

    it('should fail since no friend request exists', (done) => {
        request(app)
            .patch(`/users/${users[1]._id}/friends/${users[0]._id}`)
            .send({
                accept: false
            })
            .expect(404)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual("No friend request exists between these users");
            })
            .end(done);
    });

    it('should fail since no accept/decline value is specified', (done) => {
        request(app)
            .post(`/users/${users[0]._id}/friends/${users[1]._id}`)
            .expect(200)
            .end(() => {
                request(app)
                    .patch(`/users/${users[1]._id}/friends/${users[0]._id}`)
                    .expect(400)
                    .expect((res) => {
                        expect(res.text).toExist;
                        expect(res.text).toEqual("Required field 'accept: boolean' not specified");
                    })
                    .end(done);
            });
    });
});

describe('DELETE /users/:userID/friends/:friendID', () => {
    //TODO write tests for DELETE

});

});
