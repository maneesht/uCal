const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const  app  = require('./../server');
var { User } = require('./../src/models/user');
var { Calendar } = require('./../src/models/calendar');
var { Group } = require('./../src/models/group');
var { UEvent } = require('./../src/models/event');
const { users, calendars, events, populateUsers, populateEvents, populateCalendars, populateGroups } = require('./seed/seed');
require("supertest").agent(app.listen());

beforeEach(populateUsers);
beforeEach(populateCalendars);
beforeEach(populateEvents);
beforeEach(populateGroups);

describe('EVENT TESTS', () => {

//TODO currently all of the create tests pass a userID to be used,
//change to first log a user in and then make the call so that there is
//a current user so the route can grab the id from req.decoded.user._id
describe('POST /events/create', () => {

    // create an event normally
    it('Should successfully create an event', (done) => {
        var named = "EvEnTs"
        var eventData = {
            name: named,
            date: { day: 3, month: 4, year: 2018 },
            allDay: false,
            startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
            endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
            location: {
                activated: true,
                name: "HAAS",
                latitude: 39.4278121,
                longitude: -87.9169907
            },
            description: "CS meeting",
            owner: users[0]._id,
            calendar: calendars[0]._id,
            rsvp: { activated: true }
        }

		request(app)
			.post('/events/create')
			.send(eventData)
			.expect(200)
			.expect((res) => {
				expect(res.body.name).toBe(named);
			})
			.end(done);
    });

    //try to create an event without a name
    it('Should fail to create an event because no name is supplied', (done) => {

        var eventData = {
            date: { day: 3, month: 4, year: 2018 },
            allDay: false,
            startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
            endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
            location: {
                activated: true,
                name: "HAAS",
                latitude: 39.4278121,
                longitude: -87.9169907
            },
            description: "CS meeting",
            owner: users[0]._id,
            calendar: calendars[0]._id,
            rsvp: { activated: true }
        }

        request(app)
            .post('/events/create')
            .send(eventData)
            .expect(400)
            .end(done);
    });

    //try to create an event without a date
    it('Should fail to create an event because no date is supplied', (done) => {
        var named = "EvEnTs"
        var eventData = {
            name: named,
            allDay: false,
            startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
            endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
            location: {
                activated: true,
                name: "HAAS",
                latitude: 39.4278121,
                longitude: -87.9169907
            },
            description: "CS meeting",
            owner: users[0]._id,
            calendar: calendars[0]._id,
            rsvp: { activated: true }
        }

		request(app)
			.post('/events/create')
			.send(eventData)
			.expect(400)
			.end(done);
    });

    // try to create an event without specifying if its all day
    it('Should fail to create an event because not specified if all day', (done) => {
        var named = "EvEnTs"
        var eventData = {
            name: named,
            date: { day: 3, month: 4, year: 2018 },
            startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
            endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
            location: {
                activated: true,
                name: "HAAS",
                latitude: 39.4278121,
                longitude: -87.9169907
            },
            description: "CS meeting",
            owner: users[0]._id,
            calendar: calendars[0]._id,
            rsvp: { activated: true }
        }

		request(app)
			.post('/events/create')
			.send(eventData)
			.expect(400)
			.end(done);
    });

    // try to create an event without a calendar
    it('Should fail to create an event because no calendar is supplied', (done) => {
        var named = "EvEnTs"
        var eventData = {
            name: named,
            date: { day: 3, month: 4, year: 2018 },
            allDay: false,
            startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
            endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
            location: {
                activated: true,
                name: "HAAS",
                latitude: 39.4278121,
                longitude: -87.9169907
            },
            description: "CS meeting",
            owner: users[0]._id,
            rsvp: { activated: true }
        }

		request(app)
			.post('/events/create')
			.send(eventData)
			.expect(400)
			.end(done);
    });

    // try to create an event without specifying if there is a location
    it('Should fail to create an event because a location wasn\'t specified', (done) => {
        var named = "EvEnTs"
        var eventData = {
            name: named,
            date: { day: 3, month: 4, year: 2018 },
            allDay: false,
            startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
            endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
            location: {
                name: "HAAS",
                latitude: 39.4278121,
                longitude: -87.9169907
            },
            description: "CS meeting",
            owner: users[0]._id,
            calendar: calendars[0]._id,
            rsvp: { activated: true }
        }

		request(app)
			.post('/events/create')
			.send(eventData)
			.expect(400)
			.end(done);
    });

    // try to create an event saying there is a location but not providing it
    it('Should fail to create an event because you claimed a location, but didn\'t specify it', (done) => {
        var named = "EvEnTs"
        var eventData = {
            name: named,
            date: { day: 3, month: 4, year: 2018 },
            allDay: false,
            startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
            endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
            location: {
                activated: true,
            },
            description: "CS meeting",
            owner: users[0]._id,
            calendar: calendars[0]._id,
            rsvp: { activated: true }
        }

		request(app)
			.post('/events/create')
			.send(eventData)
			.expect(400)
			.end(done);
    });

    // try to create an event with a bad calendar ID
    it('Should fail to create an event because the calendar ID is wrong', (done) => {
        var named = "EvEnTs"
        var eventData = {
            name: named,
            date: { day: 3, month: 4, year: 2018 },
            allDay: false,
            startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
            endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
            location: {
                activated: true,
                name: "HAAS",
                latitude: 39.4278121,
                longitude: -87.9169907
            },
            description: "CS meeting",
            owner: users[0]._id,
            calendar: 123456,
            rsvp: { activated: true }
        }

        request(app)
            .post('/events/create')
            .send(eventData)
            .expect(400)
            .end(done);
    });
});


describe("POST /events/get", () => {

    // get an event normally
    it('Successfully finds event', (done) => {
        var id = events[0]._id;
        request(app)
            .post('/events/get')
            .send({"event": id})
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(events[0].name)
                expect(res.body.description).toBe(events[0].description)
            })
            .end(done);
    });

    // try to get an event with a bad ID
    it('Fails to find an event because the ID is wrong', (done) => {
        var id = events[0]._id;
        request(app)
            .post('/events/get')
            .send({"event": 1245})
            .expect(404)
            .end(done);
    });


});

describe("POST /events/update", () => {

    // update event name
    it('Should successfully change an event name', (done) => {
        var named = "EvEnTs";
        var eventData = {
            id: events[0]._id,
            name: named
        };

        request(app)
            .post('/events/update')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.name).toBe(named);
            })
            .end(done);
    });

    // update event date
    it('Should successfully change an event date', (done) => {
        var dated = {
            day: 3,
            month: 4,
            year: 2018
        };
        var eventData = {
            id: events[0]._id,
            date: dated
        };

        request(app)
            .post('/events/update')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.date.day).toBe(dated.day);
                expect(res.body.date.month).toBe(dated.month);
                expect(res.body.date.year).toBe(dated.year);
            })
            .end(done);
    });

    // update event allDay
    it('Should successfully change an event to last all day', (done) => {
        var named = "EvEnTs";
        var eventData = {
            id: events[0]._id,
            allDay: true
        };

        request(app)
            .post('/events/update')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.allDay).toBe(true);
            })
            .end(done);
    });

    // update event start time
    it('Should successfully change an event\'s start time', (done) => {
        var start = {
            day: 10,
            month: 11,
            year: 2014,
            hour: 16,
            minute: 23
        };
        var eventData = {
            id: events[0]._id,
            startTime: start
        };

        request(app)
            .post('/events/update')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.startTime.day).toBe(start.day);
                expect(res.body.startTime.month).toBe(start.month);
                expect(res.body.startTime.year).toBe(start.year);
                expect(res.body.startTime.hour).toBe(start.hour);
                expect(res.body.startTime.minute).toBe(start.minute);
            })
            .end(done);
    });

    // update event end time
    it('Should successfully change an event\'s end time', (done) => {
        var end = {
            day: 10,
            month: 11,
            year: 2014,
            hour: 16,
            minute: 23
        };
        var eventData = {
            id: events[0]._id,
            endTime: end
        };

        request(app)
            .post('/events/update')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.endTime.day).toBe(end.day);
                expect(res.body.endTime.month).toBe(end.month);
                expect(res.body.endTime.year).toBe(end.year);
                expect(res.body.endTime.hour).toBe(end.hour);
                expect(res.body.endTime.minute).toBe(end.minute);
            })
            .end(done);
    });

    // update event description
    it('Should successfully change an event description', (done) => {
        var descriptiond = "yo dog, new description"
        var eventData = {
            id: events[0]._id,
            description: descriptiond
        };

        request(app)
            .post('/events/update')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.description).toBe(descriptiond);
            })
            .end(done);
    });

    // update event calendar
    it('Should successfully change the main calendar for an event', (done) => {
        var eventData = {
            id: events[0]._id,
            calendar: calendars[1]._id
        };

        request(app)
            .post('/events/update')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.calendar).toBe(calendars[1]._id.toHexString());
            })
            .end(done);
    });

    //TODO update everything at once

    // try to update an event that doesn't exist
    it('Should fail to update an event because the ID is wrong', (done) => {
        var eventData = {
            id: 1245,
            calendar: calendars[1]._id
        };

        request(app)
            .post('/events/update')
            .send(eventData)
            .expect(404)
            .end(done);
    });


});

describe("DELETE /events/remove", () => {

    // delete an event normally
    it('Should successfully remove an event from a calendar', (done) => {
        var eventData = {
            "event": events[0]._id,
            calendar: calendars[0]._id
        };

        request(app)
            .delete('/events/remove')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.events).toExclude(events[0]._id.toHexString());
            })
            .end(done);
    });

    // try to delete an event that doesn't exist
    it('Should fail to remove an event that doesn\'t exist', (done) => {
        var eventData = {
            "event": 234512,
            calendar: calendars[0]._id
        };

        request(app)
            .delete('/events/remove')
            .send(eventData)
            .expect(400)
            .end(done);
    });

    // try to delete an event that doesn't belong to the specified calendar
    it('Should fail remove an event from a calendar that doesn\'t exist', (done) => {
        var eventData = {
            "event": events[0]._id,
            calendar: 12452
        };

        request(app)
            .delete('/events/remove')
            .send(eventData)
            .expect(400)
            .end(done);
    });

});

describe("POST /events/calendar/add", () => {

    // add an event to a calendar normally
    it('Should successfully add an event to a calendar', (done) => {
        var eventData = {
            "event": events[0]._id,
            calendar: calendars[1]._id
        };

        request(app)
            .post('/events/calendar/add')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.events).toContain(events[0]._id.toHexString());
            })
            .end(done);
    });

    // add an event to a calendar that the event already belongs to
    it('Should fail to add an event to a calendar that the event already belongs to', (done) => {
        var eventData = {
            "event": events[0]._id,
            calendar: calendars[0]._id
        };

        request(app)
            .post('/events/calendar/add')
            .send(eventData)
            .expect(400)
            .end(done);
    });

    // try to add an event that doesn't exist
    it('Should fail to add an event when the event ID is wrong', (done) => {
        var eventData = {
            "event": 12452,
            calendar: calendars[0]._id
        };

        request(app)
            .post('/events/calendar/add')
            .send(eventData)
            .expect(404)
            .end(done);
    });

    // try to add an event to a calendar that doesn't exist
    it('Should fail to add an event when the calendar ID is wrong', (done) => {
        var eventData = {
            "event": events[0]._id,
            calendar: 242124
        };

        request(app)
            .post('/events/calendar/add')
            .send(eventData)
            .expect(404)
            .end(done);
    });

});

describe("POST /events/rsvp/accept", () => {

    // accept an rsvp noramlly
    it('Should successfully accept an RSVP', (done) => {
        var eventData = {
            "event": events[0]._id,
            user: users[0]._id
        };

        request(app)
            .post('/events/rsvp/accept')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.rsvp.accepted).toContain(users[0]._id.toHexString());
            })
            .end(done);
    });

    // try to accept an rsvp to an event that doesn't exist
    it('Should fail to accept an RSVP because the event ID is wrong', (done) => {
        var eventData = {
            "event": 124512,
            user: users[0]._id
        };

        request(app)
            .post('/events/rsvp/accept')
            .send(eventData)
            .expect(404)
            .end(done);
    });

    // try to accept an rsvp for a user that doesn't exist
    it('Should fail to accept an RSVP because the user ID is wrong', (done) => {
        var eventData = {
            "event": events[0]._id,
            user: 241234
        };

        request(app)
            .post('/events/rsvp/accept')
            .send(eventData)
            .expect(400)
            .end(done);
    });

});

describe("POST /events/rsvp/decline", () => {

    // decline an rsvp noramlly
    it('Should successfully decline an RSVP', (done) => {
        var eventData = {
            "event": events[0]._id,
            user: users[0]._id
        };

        request(app)
            .post('/events/rsvp/decline')
            .send(eventData)
            .expect(200)
            .expect((res) => {
                expect(res.body.rsvp.declined).toContain(users[0]._id.toHexString());
            })
            .end(done);
    });

    // try to decline an rsvp to an event that doesn't exist
    it('Should fail to decline an RSVP because the event ID is wrong', (done) => {
        var eventData = {
            "event": 124512,
            user: users[0]._id
        };

        request(app)
            .post('/events/rsvp/decline')
            .send(eventData)
            .expect(404)
            .end(done);
    });

    // try to decline an rsvp for a user that doesn't exist
    it('Should fail to decline an RSVP because the user ID is wrong', (done) => {
        var eventData = {
            "event": events[0]._id,
            user: 241234
        };

        request(app)
            .post('/events/rsvp/decline')
            .send(eventData)
            .expect(400)
            .end(done);
    });

});


});
