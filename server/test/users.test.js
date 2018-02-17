const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
var { User } = require('./../src/models/user');
var { Calendar } = require('./../src/models/calendar');
var { Group } = require('./../src/models/group');
var { UEvent } = require('./../src/models/event');
const { users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);

describe('POST /users/validate', () => {
    /*
    it('should return user', (done) => {
        var email = users[0].email;
        var password = users[0].password;

        request(app)
            .post('/users/validate')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
                expect(res.body.password).toBe(users[0].password);
            })
            .end(done);
    });

    it('should return a 400 because the user cant be found', (done) => {
        var email = 'fake@example.com';
        var password = 'fakePass';

        request(app)
            .post('/users/validate')
            .send({ email, password })
            .expect(400)
            .expect((res) => {
                expect(res.body).toExist;
            })
            .end(done);
    });
    */
});