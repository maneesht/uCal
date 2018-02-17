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

describe('USER TESTS', () => {

describe('POST /users/login', () => {
    it('should return user', (done) => {
        var email = users[0].email;
        var password = users[0].password;

        request(app)
            .post('/login')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.body).toExist;
                expect(res.body.message).toEqual("Success!");
                expect(res.body.token).toExist;
            })
            .end(done);
    });

    it('should return a 404 because the user cant be found', (done) => {
        var email = 'fake@example.com';
        var password = 'fakePass';

        request(app)
            .post('/login')
            .send({email, password})
            .expect(404)
            .expect((res) => {
                expect(res.body).toExist;
            })
            .end(done);
    });
});

describe('POST /users/create', () => {

    it('should return user', (done) => {
        var email = "newemail@example.com";
        var password = 'password';

        request(app)
            .post('/users/create')
            .send({
                email: email,
                password: password
            })
            .expect(200)
            .expect((res) => {
                expect(res.body).toExist;
                expect(res.body).toContainKeys(['email']);
                expect(res.body.email).toEqual(email);
            })
            .end(done);
    });

    it('should return 400 because the user already exists', (done) => {
        request(app)
            .post('/users/create')
            .send({
                email: users[0].email,
                password: users[0].password
            })
            .expect(400)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual("Account already exists for: " + users[0].email);
            })
            .end(done);
    });

    it('should return 400 because the email is improperly formatted', (done) => {
        request(app)
            .post('/users/create')
            .send({
                email: "email",
                password: "password"
            })
            .expect(400)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual("email not a correct email format");
            })
            .end(done);
    });

    it('should return 400 because the request does not contain all information necessary', (done) => {
        request(app)
            .post('/users/create')
            .send({
                email: "email@example.com"
            })
            .expect(400)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual("Required Fields Unspecified");
            })
            .end(done);
    });
});

describe('PATCH /users/:userID', () => {
    it('should return successful', (done) => {
        var id;
        request(app)
            .post('/users/find')
            .send({email: users[0].email})
            .expect(200)
            .expect((res) => {
                id = res.body._id;
            })
            .end(() => {
                request(app)
                    .patch('/users/' + id)
                    .send({password: "newPass"})
                    .expect(200)
                    .expect((res) => {
                        expect(res.text).toExist;
                        expect(res.text).toEqual("Password Updated Successfully");
                    })
                    .end(() => {
                        request(app)
                            .post('/login')
                            .send({email: users[0].email, password: "newPass"})
                            .expect(200)
                            .expect((res) => {
                                expect(res.body._id).toBe(users[0]._id.toHexString());
                                expect(res.body.email).toBe(users[0].email);
                                expect(res.body.password).toBe("newPass");
                            })
                            .end(done);
                    });
            });
    });
});

describe('GET /users/:userID', () => {
    it('should return a users information', (done) => {
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
                    .get('/users/' + id)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body).toExist;
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

    it('should return a 404 since the user does not exist', (done) => {
        request(app)
            .get('/users/fakeid')
            .expect(404)
            .expect((res) => {
                expect(res.text).toEqual('User with ID fakeid not Found');
            })
            .end(done);
    });
});
});
