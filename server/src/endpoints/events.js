var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var UEvent = require('../models/event').UEvent;
let express = require('express');
const _ = require('lodash');
var q = require('q');
const { ObjectID } = require('mongodb');
const verifyToken = require('../token-handler').verifyToken;

let eventRouter = express.Router();


/**************************************************************
*                       Create Event
* - use military time for start/end times
* - have to get a calendar first so you can get a calendar ID
* - route creates empty rsvp arrays if rsvp is true
* - route creates empty invites array
* - route fills in owner id based on who is logged in
* - add verify token back in
**************************************************************/
eventRouter.post('/events/create', verifyToken, (req, res) => {

    //these are all of the things the user can pass
    var body = _.pick(req.body, ['name', 'date', 'allDay', 'startTime', 'endTime', 'location', 'description', 'calendar', 'rsvp']);

    // make checks for things needed
    if (!body.name || !body.date || body.allDay === undefined || !body.calendar || body.rsvp === undefined || body.rsvp.activated === undefined || body.location === undefined || body.location.activated === undefined ) {
        return res.status(400).send("you are missing some of the required information: name, date, allDay, calendar, rsvp.activated, and location.activated");
    }

    var eventdata = new Object();
    eventdata.name = body.name;
    eventdata.date = body.date;
    eventdata.allDay = body.allDay;

    // if all day is true then you don't need start or end time, otherwise you do
    if (body.allDay === false) {
        if (!body.startTime || !body.endTime) {
            return res.status(400).type('text/plain').send("because the event is not all day you must supply a start and end time");
        }
        eventdata.startTime = body.startTime;
        eventdata.endTime = body.endTime;
    }
    // if the event is all day make the start time the beginning of the day and the end time the end
    else {
        eventdata.startTime = {
            day: body.date.day,
            month: body.date.month,
            year: body.date.year,
            hour: 0,
            minute: 0
        };
        eventdata.endTime = {
            day: body.date.day,
            month: body.date.month,
            year: body.date.year,
            hour: 23,
            minute: 59
        };
    }

    if (body.location.activated === true) {
        if(!body.location.name) {
            return res.status(400).send("because you said there is a location you must supply one");
        }
        eventdata.location = body.location;
    }
    // if the location is not activated just fill in default values
    else {
        eventdata.location = {
            activated: false,
            name: "",
            longitude: 0,
            latitude: 0
        };
    }

    // if there is no description passed make he description ""
    if (!body.description) {
        eventdata.description = "";
    }
    else {
        eventdata.description = body.description;
    }

    eventdata.owner = ObjectID(req.decoded.user._id);

    eventdata.calendar = body.calendar;
    eventdata.invites = [];
    eventdata.rsvp = {
        activated: body.rsvp.activated,
        accepted: [],
        declined: []
    };

    var uevent = new UEvent(eventdata);

    uevent.save().then((savedEvent) => {
        Calendar.findByIdAndUpdate(savedEvent.calendar,
            { $push: { events: savedEvent._id } },
            { new: true }
        ).then((calendar) => {
                return res.status(200).send(savedEvent);
            }).catch(() => {
                return res.status(400).send("Failed to save event to calendar");
            });
        }).catch(() => {
            return res.status(400).send("Failed to create event");
        });

});

//  Get Event
//  send a post request with the event id in the body
eventRouter.post('/events/get', (req, res) => {
    var body = _.pick(req.body, ['event']);

    UEvent.findById(ObjectID(body.event))
        .then((uevent) => {
            if (uevent === null) {
                return res.status(404).send("Event not Found");
            }
            return res.status(200).send(uevent)
        }).catch((err) => {
            return res.status(500).send("Lookup failed");
        });
});


//Update Event
eventRouter.post('/events/update', (req, res) => {

    var body = _.pick(req.body, ['id', 'name', 'date', 'allDay', 'startTime', 'endTime', 'location', 'description', 'owner', 'calendar', 'rsvp']);


    UEvent.findById(ObjectID(body.id))
        .then((uevent) => {
            if (uevent === null) {
                return res.status(404).send("Event not Found");
            }
            /*
            if (body.name !== undefined) {
                uevent.name = body.name;
            }
            */
            if (body.date !== undefined) {
                uevent.date = body.date;
            }
            if (body.allDay !== undefined) {

                uevent.allDay = body.allDay;
                //if the event is changed to all day then adjust the start/end time accordingly
                if (body.allDay === true) {
                    body.startTime = {
                        day: uevent.date.day,
                        month: uevent.date.month,
                        year: uevent.date.year,
                        hour: 0,
                        minute: 0
                    };
                    body.endTime = {
                        day: uevent.date.day,
                        month: uevent.date.month,
                        year: uevent.date.year,
                        hour: 23,
                        minute: 59
                    };
                }
            }
            if (body.startTime !== undefined) {
                uevent.startTime = body.startTime;
            }
            if (body.endTime !== undefined) {
                uevent.endTime = body.endTime;
            }
            if (body.location !== undefined) {
                uevent.location = body.location;
            }
            if (body.description !== undefined) {
                uevent.description = body.description;
            }
            if (body.owner !== undefined) {
                uevent.owner = body.owner;
            }
            if (body.calendar !== undefined) {
                uevent.calendar = body.calendar;
            }
            // you can only update whether or not a rsvp is activated
            if (body.rsvp !== undefined) {
                uevent.rsvp.activated = body.rsvp;
            }
            uevent.save().then((savedEvent) => {
                    return res.status(200).send(savedEvent);
                }).catch(() => {
                    return res.status(400).send("Failed to save event");
                });
        }).catch((err) => {
            return res.status(404).send(err);
        });
});

//Delete Event
//deleting an event is removing it from a calendar because the event might belong
//to multiple calendars
eventRouter.delete('/events/remove', (req, res) => {
    var body = _.pick(req.body, ['event', 'calendar']);
    Calendar.findById(ObjectID(body.calendar))
        .then((calendar) => {

            var index = calendar.events.indexOf(ObjectID(body.event));
            var index2 = calendar.events.indexOf(body.event); //bc not sure if it will be objID or string
            if (index !== -1) {
                calendar.events.splice(index, 1);

                calendar.save().then((updatedCalendar) => {
                        return res.status(200).send(updatedCalendar);
                    }).catch(() => {
                        return res.status(400).send("Failed to remove the event");
                    });
            }
            else if (index2 !== -1) {
                calendar.events.splice(index2, 1);

                calendar.save().then((updatedCalendar) => {
                        return res.status(200).send(updatedCalendar);
                    }).catch(() => {
                        return res.status(400).send("Failed to remove the event");

                    });
            }
            else {
                return res.status(400).send("That event doesn't belong to that calendar");
            }
        }).catch((err) => {
            return res.status(400).send("that calendar does not exist");
        })
});

// add event to calendar
eventRouter.post('/events/calendar/add', (req, res) => {

    var body = _.pick(req.body, ['event', 'calendar']);

    Calendar.findById(ObjectID(body.calendar))
        .then((calendar) => {

            //don't add the event if its already there
            var index = calendar.events.indexOf(ObjectID(body.event));
            var index2 = calendar.events.indexOf(body.event); //bc not sure if it will be objID or string
            if (index !== -1) {
                return res.status(400).send("that event is already in the calendar");
            }
            else if (index2 !== -1) {
                return res.status(400).send("that event is already in the calendar");
            }

            //make sure the event exists
            UEvent.findById(ObjectID(body.event))
                .then((uevent) => {
                    calendar.events.push(body.event);

                    calendar.save().then((savedCalendar) => {
                            return res.status(200).send(savedCalendar);
                        }).catch((err) => {
                            return res.status(400).send("Failed to add the event to the calendar");
                        });
                }).catch(() => {
                    return res.status(404).send("Event not Found");
                })
        }).catch(() => {
            return res.status(404).send("Calendar not Found");
        });
});

//accept RSVP
eventRouter.post('/events/rsvp/accept', (req, res) => {

    var body = _.pick(req.body, ['event', 'user']);

    UEvent.findById(ObjectID(body.event))
        .then((uevent) => {

            //remove the user from the declined list if he is there
            var index = uevent.rsvp.declined.indexOf(ObjectID(body.user));
            var index2 = uevent.rsvp.declined.indexOf(body.user); //bc not sure if it will be objID or string
            if (index !== -1) {
                uevent.rsvp.declined.splice(index, 1);
            }
            else if (index2 !== -1) {
                uevent.rsvp.declined.splice(index2, 1);
            }

            User.findById(ObjectID(body.user))
                .then((user) => {
                    uevent.rsvp.accepted.push(body.user);

                    uevent.save().then((savedEvent) => {
                            return res.status(200).send(savedEvent);
                        }).catch(() => {
                            return res.status(400).send("Failed to accept the RSVP to the event");
                        });
                }).catch(() => {
                    return res.status(400).send("That user does not exist");
                });
        }).catch(() => {
            return res.status(404).send("Event not Found");
        });
});

//decline RSVP
//could be changed so that the userID is grabbed server side
eventRouter.post('/events/rsvp/decline', (req, res) => {

    var body = _.pick(req.body, ['event', 'user']);

    UEvent.findById(ObjectID(body.event))
        .then((uevent) => {

            //remove the user from the accepted list if he is there
            var index = uevent.rsvp.accepted.indexOf(ObjectID(body.user));
            var index2 = uevent.rsvp.accepted.indexOf(body.user); //bc not sure if it will be objID or string
            if (index !== -1) {
                uevent.rsvp.accepted.splice(index, 1);
            }
            else if (index2 !== -1) {
                uevent.rsvp.accepted.splice(index2, 1);
            }

            User.findById(ObjectID(body.user))
                .then((user) => {
                    uevent.rsvp.declined.push(body.user);

                    uevent.save().then((savedEvent) => {
                            return res.status(200).send(savedEvent);
                        }).catch(() => {
                            return res.status(400).send("Failed to decline the RSVP to the event");
                        });
                }).catch(() => {
                    return res.status(400).send("That user does not exist");
                });
        }).catch(() => {
            return res.status(404).send("Event not Found");
        });
});

module.exports = eventRouter;
