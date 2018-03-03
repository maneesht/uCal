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

describe('FRIEND TESTS', () => {

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

        it('should fail since a the users are already friends', (done) => {
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
                        .end(() => {
                            request(app)
                                .post(`/users/${users[0]._id}/friends/${users[1]._id}`)
                                .expect(400)
                                .expect((res) => {
                                    expect(res.text).toExist;
                                    expect(res.text).toEqual("Already friends");
                                })
                                .end(done);
                        });
                });
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

    describe('GET /users/:userID/pending-friends', () => {
        it('should return the user who requested to be your friend', (done) => {
            request(app)
                .post(`/users/${users[0]._id}/friends/${users[1]._id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.text).toExist;
                    expect(res.text).toEqual("Friend request sent");
                })
                .end(() => {
                    request(app)
                        .get(`/users/${users[1]._id}/pending-friends`)
                        .expect(200)
                        .expect((res) => {
                            expect(res.body).toExist;
                            expect(res.body).toEqual([`${users[0]._id}`]);
                        })
                        .end(done)
                });
        });

        it('should return an empty array since no you have no friend requests', (done) => {
            request(app)
                .get(`/users/${users[1]._id}/pending-friends`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist;
                    expect(res.body).toEqual([]);
                })
                .end(done)
        });
    });

    describe('GET /users/:userID/friends', () => {
        it('should return your friends', (done) => {
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
                        .end(() => {
                            request(app)
                                .get(`/users/${users[1]._id}/friends`)
                                .expect(200)
                                .expect((res) => {
                                    expect(res.body).toExist;
                                    expect(res.body).toEqual([`${users[0]._id}`]);
                                })
                                .end(done)
                        });
                });
        });

        it('should return an empty array since have no friends', (done) => {
            request(app)
                .get(`/users/${users[1]._id}/friends`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist;
                    expect(res.body).toEqual([]);
                })
                .end(done)
        });
    });

    describe('DELETE /users/:userID/friends/:friendID', () => {
        //TODO write tests for DELETE
        it('should successfully remove the friendship', (done) => {
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
                        .end(() => {
                            request(app)
                                .delete(`/users/${users[0]._id}/friends/${users[1]._id}`)
                                .expect(200)
                                .expect((res) => {
                                    expect(res.text).toExist;
                                    expect(res.text).toEqual("Removed Friend");
                                })
                                .end(done);
                        });
                });
        });

        it('should return success since no friendship existed to begin with', (done) => {
            //This is a bit strange but if you are trying to delete a friendship and there is no
            //friendship already it technically completed sucessfully if it did nothing
            request(app)
                .delete(`/users/${users[0]._id}/friends/${users[1]._id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.text).toExist;
                    expect(res.text).toEqual("Removed Friend");
                })
                .end(done);
        })
    });
});
