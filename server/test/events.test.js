const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const  app  = require('./../server');
var { User } = require('./../src/models/user');
var { Calendar } = require('./../src/models/calendar');
var { Group } = require('./../src/models/group');
var { Evento } = require('./../src/models/event');
const { users, calendars, events, populateUsers, populateCalendars, populateEvents } = require('./seed/seed');

require("supertest").agent(app.listen());
var eventOne;
var eventTwo;
var calendarOne;
before(() => {
    
    calendarOne = new Calendar(calendars[0]);
    calendarOne.save();

    eventOne = new Evento(events[0]);
    eventOne.save();

    eventTwo = new Evento(events[1]);
    eventTwo.save();


});

describe('Create events', () => {
    
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



    describe("Find Event", () => {
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

    describe("Update Event", () => {
        it('Successfully update event, new name', (done) => {
           eventTwo.name = "Updated name for Event Two" ;
           var val = eventTwo;
                request(app)
                    .patch('/events/updateEvent')
                    .send(val)
                    .expect(200)
                    .end(done);
        });
        /*
        it('Fails to update event, Event Not Found', (done) => {

                 request(app)
                     .patch('/events/updateEvent')
                     .send({_id: ObjectID(1), name: "Not known"})
                     .expect(400)
                     .end(done);
         });
         */
    });

    /*
    describe("Remove Event", () => {
        it('Successfully removes event', (done) => {
            var id = eventTwo._id;
                request(app)
                    .delete('/events/removeEvent')
                    .send({id})
                    .expect(200)
                    .end(done);
        });
    });
    */

});
