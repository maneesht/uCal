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

    describe('POST /users/friends/:friendID', () => {
        it('should return a success', (done) => {
            request(app)
                .post(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.text).toExist;
                    expect(res.text).toEqual("Friend request sent");
                })
                .end(done);
        });

        it('should return a 404 since the user does not exist', (done) => {
            request(app)
                .post(`/users/friends/fakeID`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(404)
                .expect((res) => {
                    expect(res.text).toExist;
                    expect(res.text).toEqual("User not Found");
                })
                .end(done);
        });

        it('should fail since the users are already friends', (done) => {
            request(app)
                .post(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .end(() => {
                    request(app)
                        .patch(`/users/friends/${users[0]._id}`)
                        .set('x-access-token', `Bearer ${users[1].token}`)
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
                                .post(`/users/friends/${users[1]._id}`)
                                .set('x-access-token', `Bearer ${users[0].token}`)
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

    describe('PATCH /users/friends/:friendID', () => {
        it('should accept the friend request', (done) => {
            request(app)
                .post(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .end(() => {
                    request(app)
                        .patch(`/users/friends/${users[0]._id}`)
                        .set('x-access-token', `Bearer ${users[1].token}`)
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
                .post(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .end(() => {
                    request(app)
                        .patch(`/users/friends/${users[0]._id}`)
                        .set('x-access-token', `Bearer ${users[1].token}`)
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
                .patch(`/users/friends/${users[0]._id}`)
                .set('x-access-token', `Bearer ${users[1].token}`)
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
                .post(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .end(() => {
                    request(app)
                        .patch(`/users/friends/${users[0]._id}`)
                        .set('x-access-token', `Bearer ${users[1].token}`)
                        .expect(400)
                        .expect((res) => {
                            expect(res.text).toExist;
                            expect(res.text).toEqual("Required field 'accept: boolean' not specified");
                        })
                        .end(done);
                });
        });
    });

    describe('GET /user/pending-friends', () => {
        it('should return the user who requested to be your friend', (done) => {
            request(app)
                .post(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.text).toExist();
                    expect(res.text).toEqual("Friend request sent");
                })
                .end(() => {
                    request(app)
                        .get(`/user/pending-friends`)
                        .set('x-access-token', `Bearer ${users[1].token}`)
                        .expect(200)
                        .expect((res) => {
                            expect(res.body).toExist();
                            expect(res.body).toEqual([`${users[0]._id}`]);
                        })
                        .end(done)
                });
        });

        it('should return an empty array since no you have no friend requests', (done) => {
            request(app)
                .get('/user/pending-friends')
                .set('x-access-token', `Bearer ${users[1].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist;
                    expect(res.body).toEqual([]);
                })
                .end(done)
        });
    });

    describe('GET /users/get-friends', () => {
        it('should return your friends', (done) => {
            request(app)
                .post(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .end(() => {
                    request(app)
                        .patch(`/users/friends/${users[0]._id}`)
                        .set('x-access-token', `Bearer ${users[1].token}`)
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
                                .get(`/user/get-friends`)
                                .set('x-access-token', `Bearer ${users[1].token}`)
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
                .get(`/user/get-friends`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist;
                    expect(res.body).toEqual([]);
                })
                .end(done)
        });
    });

    describe('DELETE /users/friends/:friendID', () => {
        //TODO write tests for DELETE
        it('should successfully remove the friendship', (done) => {
            request(app)
                .post(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .end(() => {
                    request(app)
                        .patch(`/users/friends/${users[0]._id}`)
                        .set('x-access-token', `Bearer ${users[1].token}`)
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
                                .delete(`/users/friends/${users[1]._id}`)
                                .set('x-access-token', `Bearer ${users[0].token}`)
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
                .delete(`/users/friends/${users[1]._id}`)
                .set('x-access-token', `Bearer ${users[0].token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.text).toExist;
                    expect(res.text).toEqual("Removed Friend");
                })
                .end(done);
        })
    });
});
