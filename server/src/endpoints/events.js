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
//Create Event


eventRouter.post('/events/create', verifyToken, (req, res) => {
    var eventData = _.pick(req.body, ['name', 'date', 'allDay', 'startTime', 'endTime', 'location', 'description', 'calendar']);
    eventData.owner = req.decoded.userId._id;
    eventData.startTime = JSON.parse(eventData.startTime);
    eventData.endTime = JSON.parse(eventData.endTime);
    eventData.location = JSON.parse(eventData.location);
    var event = new UEvent(eventData);
    
    console.log(event);
    console.log(eventData);
    /*
    event.save().catch(() => {
        return res.status(400).send("Failed to save event");
    });
    */

     event.save().then((calendar) => {
        
     Calendar.findByIdAndUpdate(event.calendar,  
        {$push: {events: event}}
        ).then((user) => {
            return res.status(200).send(event);   
        }).catch(() => {
            return res.status(400).send("Failed to save event to calendar");
        });

     }).catch(() => {
        return res.status(400).send("Failed to save event");
    });
    
});

//Update Event
eventRouter.patch('/events/updateEvent', (req, res) => {
    UEvent.findByIdAndUpdate( ObjectID(req.body._id) , {name: req.body.name, date: req.body.date, allDay: req.body.allDay, startTime:  req.body.startTime, endTime: req.body.endTime, location: req.body.location, description: req.body.description, owner: req.body.owner, calendar: req.body.calendar})
    .then((event) => {
        return res.status(200).send(event);
    }).catch((err) => {
        return res.status(400).send(err);
    });
});

//Get Event
eventRouter.get('/events/getevent', (req, res) => {
    console.log('getting event');
        UEvent.findById( ObjectID(req.body.id)).then(event => {
            var data = {
            name: event.name,
            date: event.date,
            allDay: event.allDay,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            description: event.description,
            calendar: event.calendar
            }
            return res.status(200).send(data)
        }).catch(() => {
            return res.status(404).send("Event not Found");
        });
        
});

//Delete Event
eventRouter.delete('/events/removeEvent', (req, res) => {
    var event = UEvent.findById(ObjectID(req.body.id));
    UEvent.findByIdAndRemove(req.params.id).then((event) => {
        //remove from calendar
       // Calendar.findByIdAndUpdate(ObjectID(event.calendar), {$pull: {events: event}}).then((calendar) => {
            return res.status(200).send("event removed from calendar");
       // });
    }).catch((err) => {
        console.log(err);
        return res.status(400).send(err);
    })
});
module.exports = eventRouter;

//declineRSVP
//acceptRSVP
//noRSVP