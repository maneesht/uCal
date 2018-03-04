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

describe('POST /events/create', () => {

    //TODO create an event normally

    //TODO try to create an event without a name

    //TODO try to create an event without a date

    //TODO try to create an event without specifying if its all day

    //TODO try to create an event without a calendar

    //TODO try to create an event without specifying if there is a location

    //TODO try to create an event saying there is a location but not providing it

    //TODO try to create an event with a bad calendar ID

    it('Successfully creates event', (done) => {
        var name = "Simple event created";
        var date = events[0].date;
        var allday = events[0].allDay;
        var startTime = events[0].startTime;
        var endTime = events[0].endTime;
        var location = events[0].location;
        var description = events[0].description;
        var cal = events[0].calendar;
        var owner = events[0].owner;

		request(app)
			.post('/events/create')
			.send({name, date, allday, startTime, endTime, location, description, cal, owner})
			.expect(200)
			.expect((res) => {
				expect(res.body.name).toBe(name);
				expect(res.body.description).toBe(events[0].description);
			})
			.end(done);
    });

    it('Bad Request Invalid json, no name', (done) => {

        var date = events[0].date;
        var allday = events[0].allDay;
        var startTime = events[0].startTime;
        var endTime = events[0].endTime;
        var location = events[0].location;
        var description = events[0].description;
        var cal = events[0].calendar;
        var owner = events[0].owner;

		request(app)
			.post('/events/create')
			.send({ date, allday, startTime, endTime, location, description, cal, owner})
            .expect(400)
            .expect((res) => {
                expect(res.text).toBe("Failed to save event");
            })
			.end(done);
    });
});


describe("POST /events/get", () => {

    //TODO get an event normally

    //TODO try to get an event with a bad ID


    it('Successfully finds event', (done) => {
        var id = eventOne._id;
            request(app)
                .get('/events/getevent')
                .send({id})
                .expect(200)
                .expect((res) => {
                expect(res.body.name).toBe(eventOne.name)
                expect(res.body.description).toBe(eventOne.description)
                })
                .end(done);
    });

    it('Fails, event does not exist', (done) => {
        var id = 1;
            request(app)
                .get('/events/getevent')
                .send({id})
                .expect(404)
                .expect((res) => {
                    expect(res.text).toBe("Event not Found");
                })
                .end(done);
    });


});

describe("POST /events/update", () => {

    //TODO update event name

    //TODO update event date

    //TODO update event allDay

    //TODO update event start time

    //TODO update event end time

    //TODO update event description

    //TODO update event calendar

    //TODO update everything at once

    //TODO try to update an event that doesn't exist


});

describe("DELETE /events/remove", () => {

    //TODO delete an event normally

    //TODO try to delete an event that doesn't exist

});

describe("POST /events/calendar/add", () => {

    //TODO add an event to a calendar normally

    //TODO add an event to a calendar that the event already belongs to

    //TODO try to add an event that doesn't exist

    //TODO try to add an event to a calendar that doesn't exist

});

describe("POST /events/rsvp/accept", () => {

    //TODO accept an rsvp noramlly

    //TODO try to accept an rsvp to an event that doesn't exist

    //TODO try to accept an rsvp for a user that doesn't exist

});

describe("POST /events/rsvp/decline", () => {

    //TODO accept an rsvp noramlly

    //TODO try to decline an rsvp to an event that doesn't exist

    //TODO try to decline an rsvp for a user that doesn't exist

});


});
