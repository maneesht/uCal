const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const app = require('./../server');
var { User } = require('./../src/models/user');
var { Calendar } = require('./../src/models/calendar');
var { Group } = require('./../src/models/group');
var { UEvent } = require('./../src/models/event');
const { users, populateUsers } = require('./seed/seed');
require("supertest").agent(app.listen());
beforeEach(populateUsers);

describe('USER TESTS', () => {

    describe('POST /users/login', () => {
        it('should return user', (done) => {
            var email = users[0].email;
            var password = users[0].password;

            request(app)
                .post('/login')
                .send({ email, password })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.body.message).toEqual("Success!");
                    expect(res.body.token).toExist();
                })
                .end(done);
        });

        it('should return a 401 because the user cant be found', (done) => {
            var email = 'fake@example.com';
            var password = 'fakePass';

            request(app)
                .post('/login')
                .send({ email, password })
                .expect(401)
                .expect((res) => {
                    expect(res.body).toExist();
                })
                .end(done);
        });

        it('should return a 401 because no password in body', (done) => {
            var email = 'fake@example.com';
            request(app)
                .post('/login')
                .send({ email })
                .expect(401)
                .expect((res) => {
                    expect(res.body).toExist();
                })
                .end(done);
        });

        it('should return a 401 because no email in body', (done) => {
            var email = 'fake@example.com';
            var password = 'fakePass';
            request(app)
                .post('/login')
                .send({ password })
                .expect(401)
                .expect((res) => {
                    expect(res.body).toExist();
                })
                .end(done);
        });


        it('should return a 401 because no email or password in body', (done) => {
            request(app)
                .post('/login')
                .send({})
                .expect(401)
                .expect((res) => {
                    expect(res.body).toExist();
                })
                .end(done);
        });

    });

    describe('POST /signup', () => {

        it('should return user', (done) => {
            var email = "newemail@example.com";
            var password = 'password';

            request(app)
                .post('/signup')
                .send({
                    email: email,
                    password: password
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toExist();
                    expect(res.body).toContainKeys(['token']);
                    expect(res.body.message).toEqual('Success!');
                })
                .end(done);
        });

        it('should return 401 because the user already exists', (done) => {
            request(app)
                .post('/signup')
                .send({
                    email: users[0].email,
                    password: users[0].password
                })
                .expect(401)
                .expect((res) => {
                    expect(res.text).toExist();
                    expect(res.text).toEqual("Account already exists for: " + users[0].email);
                })
                .end(done);
        });

        it('should return 401 because the email is improperly formatted', (done) => {
            request(app)
                .post('/signup')
                .send({
                    email: "email",
                    password: "password"
                })
                .expect(401)
                .expect((res) => {
                    expect(res.text).toExist();
                    expect(res.text).toEqual("email not a correct email format");
                })
                .end(done);
        });

        it('should return 401 because the request does not contain all information necessary', (done) => {
            request(app)
                .post('/signup')
                .send({
                    email: "email@example.com"
                })
                .expect(401)
                .expect((res) => {
                    expect(res.body.message).toExist();
                    expect(res.body.message).toEqual('Missing credentials');
                })
                .end(done);
        });
    });

    describe('PATCH /users/:userID', () => {
        it('should return successful', (done) => {
            var id;
            request(app)
                .post('/users/find')
                .send({ email: users[0].email })
                .expect(200)
                .expect((res) => {
                    id = res.body._id;
                })
                .end(() => {
                    request(app)
                        .patch('/users/' )
                        .set('x-access-token', 'Bearer ' + users[0].token)
                        .send({ password: "newPass" })
                        .expect(200)
                        .expect((res) => {
                            expect(res.text).toExist();
                            expect(res.text).toEqual("Password Updated Successfully");
                        })
                        .end(() => {
                            request(app)
                                .post('/login')
                                .send({ email: users[0].email, password: "newPass" })
                                .expect(200)
                                .expect((res) => {
                                    expect(res.body).toExist();
                                    expect(res.body.message).toEqual("Success!");
                                    expect(res.body.token).toExist();
                                })
                                .end(done);
                        });
                });
        });
    });

    describe('GET /users/:userID', () => {
        it(`should return a user's information`, (done) => {
            var id;
            request(app)
                .post('/users/find')
                .send({
                    email: users[0].email
                })
                .expect(200)
                .expect((res) => {
                    id = res.body._id;
                })
                .end(() => {
                    request(app)
                        .get('/users' )
                        .set('x-access-token', 'Bearer ' + users[0].token)
                        .expect(200)
                        .expect((res) => {
                            expect(res.body).toExist();
                            expect(res.body).toContainKeys(['email', 'userId', 'groups', 'calendars', 'friends']);
                            expect(res.body.email).toEqual(users[0].email);
                            expect(res.body.userId).toEqual(id);
                            expect(res.body.groups).toBeAn(Array);
                            expect(res.body.calendars).toBeAn(Array);
                            expect(res.body.friends).toBeAn(Array);
                        })
                        .end(done);
                });
        });

        it('should return a 403 since the user does not exist', (done) => {
            request(app)
                .get('/users/')
                .set('x-access-token', 'Bearer ' + "12345678")
                .expect(403)
                .expect((res) => {
                    //console.log(res);
                    expect(res.body.message).toEqual('Failed to authenticate token.');
                })
                .end(done);
        });

        it(`should fail to return a user's information`, (done) => {
            var id;
            request(app)
                .post('/users/find')
                .send({
                    email: 'fakeaccount@purdue.edu'
                })
                .expect(400)
                .end(done);
        });
    });
});
