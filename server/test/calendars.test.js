const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const  app = require('./../server');
var { User } = require('./../src/models/user');
var { Calendar } = require('./../src/models/calendar');
var { Group } = require('./../src/models/group');
var { UEvent } = require('./../src/models/event');
const { users, groups, calendars, populateUsers, populateEvents, populateCalendars, populateGroups } = require('./seed/seed');
require("supertest").agent(app.listen());

beforeEach(populateUsers);
beforeEach(populateCalendars);
beforeEach(populateEvents);
beforeEach(populateGroups);


describe('CALENDAR TESTS', () => {
//test creating a calendar for a user
describe('POST /users/:userID/calendars', () => {
    //add a calendar in a normal way
    it('should create a calendar for the user', (done) => {

        var name = "TestCal"
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .post(`/users/${users[0]._id}/calendars`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send(calendar)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(name);
                expect(res.body.description).toBe(description);
                expect(res.body.owner).toEqual(users[0]._id);
                expect(res.body.users[0]).toBe(users[0]._id.toHexString());
            })
            .end(done);
    });

    it('should create calendar with no description', (done) => {

        var name = "TestCalNoDescription"
        var calendar = {
            calendar: {
                name
            }
        }

        request(app)
            .post(`/users/${users[0]._id}/calendars`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send(calendar)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(name);
                expect(res.body.owner).toBe(users[0]._id.toHexString());
                expect(res.body.users[0]).toBe(users[0]._id.toHexString());
                //check that the calendar was added to the user's list of calendars
            })
            .end(done);
    });

    it('should fail to create a calendar for the user, no name', (done) => {

        var name; //= "TestCal"
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .post(`/users/${users[0]._id}/calendars`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send(calendar)
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe('No name value was given');
            })
            .end(done);
    });

    it('should fail to create a calendar, no calendar in body', (done) => {

        var name = "TestCal"
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .post(`/users/${users[0]._id}/calendars`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send()
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe('No calendar data was supplied');
            })
            .end(done);
    });

    //TODO add a calendar with an invalid userID

});


//test creating a calendar for a group
describe('POST /groups/:groupID/calendars', () => {
    //TODO add a calendar normally
    it('should create a calendar for the group', (done) => {

        var name = "TestCalGroup"
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .post(`/groups/${groups[0]._id}/calendars`)
            .send(calendar)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(name);
                expect(res.body.description).toBe(description);
                expect(res.body.owner).toEqual(groups[0].owner.toHexString());
            })
            .end(done);
    });

    it('should create calendar with no description', (done) => {

        var name = "TestCalNoDescription"
        var calendar = {
            calendar: {
                name
            }
        }

        request(app)
            .post(`/groups/${groups[0]._id}/calendars`)
            .send(calendar)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(name);
                expect(res.body.owner).toBe(users[0]._id.toHexString());
                expect(res.body.users[0]).toBe(users[0]._id.toHexString());
                //check that the calendar was added to the user's list of calendars
            })
            .end(done);
    });

    it('should fail to create a calendar for the user, no name', (done) => {

        var name; //= "TestCal"
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .post(`/groups/${groups[0]._id}/calendars`)
            .send(calendar)
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe('No name value was given');
            })
            .end(done);
    });

    it('should fail to create a calendar, no calendar in body', (done) => {

        var name = "TestCal"
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .post(`/groups/${groups[0]._id}/calendars`)
            .send()
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe('No calendar data was supplied');
            })
            .end(done);
    });

    it('should fail to create a calendar, group not found', (done) => {

        var name = "TestCal"
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        var id = ObjectID(000);

        request(app)
            .post(`/groups/${id}/calendars`)
            .send(calendar)
            .expect(404)
            .expect((res) => {
                expect(res.text).toBe('Group not Found');
            })
            .end(done);
    });
});


//test deleting a calendar
describe('DELETE /calendars/:calendarID', () => {
    //delete a calendar in a normal way
    it('should delete a calendar', (done) => {
        request(app)
            .delete(`/calendars/${calendars[1]._id}`)
            .expect(200)
            .expect((res) => {
                //console.log(res.text);
                expect(res.body).toExist;
            })
            .end(done);
            //check to make sure all of the events belonging to this calendar were removed?
    });

    //try to delete a calendar that doesn't exist
    it('should fail to delete a calendar invalid id', (done) => {
        request(app)
            .delete(`/calendars/12456`)
            .expect(400)
            .expect((res) => {
                expect(res.body).toExist;
                //check that the error message is right?
            })
            .end(done);
    });
});


//test getting a calendar
describe('GET /calendars/:calendarID', () => {
    //get an individual calendar in a normal way
    it('should get the requested calendar', (done) => {
        request(app)
            .get(`/calendars/${calendars[0]._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(calendars[0].name);
                expect(res.body.description).toBe(calendars[0].description);
                expect(res.body.owner).toBe(calendars[0].owner.toHexString());
                expect(res.body.users[0]).toBe(users[0]._id.toHexString());
                //also group is?
                //also events are?
            })
            .end(done);
    });

    it('should fail to get calendar, invalid id', (done) => {
        var id = ObjectID(000);
        request(app)
            .get(`/calendars/${id}`)
            .expect(404)
            .expect((res) => {
                expect(res.text).toBe("Calendar not Found");
            })
            .end(done);
    });

});


//test updating a calendar's name and/or description
describe('PATCH /calendars/:calendarID', () => {
    //patch a calendar name and description normally
    it('should change a calendar\'s name', (done) => {

        var name = "changedNAME"
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .patch(`/calendars/${calendars[0]._id}`)
            .send(calendar)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(name);
                expect(res.body.description).toBe(description);
            })
            .end(done);
    });

    it('should change a calendar\'s description', (done) => {

        var name = "NAME"
        var description = "updated description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .patch(`/calendars/${calendars[0]._id}`)
            .send(calendar)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(name);
                expect(res.body.description).toBe(description);
            })
            .end(done);
    });

    //try to change the values of a calendar that doesn't exist
    it('should return 400 because the requested calendar does not exist', (done) => {

        var name = "changedNAME"
        var description = "description BRO"
        var calendar = {
            calendar: {
                name,
                description
            }
        }
        request(app)
            .patch(`/calendars/24242412`)
            .send(calendar)
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe("Failed to update calendar");
                //check that the error message is correct?
            })
            .end(done);
    });




    it('should fail to change a calendar\'s name to \"\"', (done) => {

        var name
        var description = "description BRO"

        var calendar = {
            calendar: {
                name,
                description
            }
        }

        request(app)
            .patch(`/calendars/${calendars[0]._id}`)
            .send(calendar)
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe("Invalid name value given")
            })
            .end(done);
    });


    //TODO try to change a value other than name or description
    //need to double check this test

    it('should fail to change a calendar\'s owner', (done) => {

        var name = "NAME"
        var description = "description BRO"
        var owner = new ObjectID();
        var calendar = {
            calendar: {
                name,
                description,
                owner
            }
        }

        request(app)
            .patch(`/calendars/${calendars[0]._id}`)
            .send(calendar)
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe("Too many values inputted")
            })
            .end(done);
    });


});


//test sharing a calendar
describe('PATCH /calendars/:calendarID/share', () => {
    //try to normally share the calendar with one user who can edit
    it('should share the calendar with a user who can edit', (done) => {

        var use = {
            users: [users[1]._id]
        }
        var edit = true

        request(app)
            .patch(`/calendars/${calendars[0]._id}/share`)
            .send(use)
            .expect(200)
            .expect((res) => {
                expect(res.body.users).toContain(users[1]._id);
                //check that the users have the calendar added to their calendars and that they can edit
            })
            .end(done);
    });

    //try to normally share the calendar with one user who can't edit
    it('should share the calendar with a user who can\'t edit', (done) => {

        var use = {
            users: [users[1]._id]
        }
        var edit = false

        request(app)
            .patch(`/calendars/${calendars[0]._id}/share`)
            .send(use)
            .expect(200)
            .expect((res) => {
                expect(res.body.users).toContain(users[1]._id);
                //check that the users have the calendar added to their calendars and that they can edit
            })
            .end(done);
    });

    //try to share a calendar that doesn't exist
    it('should fail to share a calendar that does not exist', (done) => {

        var use = {
            users: [users[1]._id]
        }
        var edit = false

        request(app)
            .patch(`/calendars/123423142/share`)
            .send(use)
            .expect(400)
            .expect((res) => {
                expect(res.body).toExist;
                //check that the users have the calendar added to their calendars and that they can edit
            })
            .end(done);
    });


    //TODO try to share the calendar with a user that doesn't exist

    //TODO try to share the calendar with multiple users
});

});
