var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var Evento = require('../models/event').Evento;
let express = require('express');
const _ = require('lodash');
var q = require('q');
const { ObjectID } = require('mongodb');

let eventRouter = express.Router();
//Create Event


eventRouter.post('/events/create', (req, res) => {
    var eventData = _.pick(req.body, ['name', 'date', 'allday', 'startTime', 'endTime', 'location', 'description', 'owner', 'calendar']);
    var event = new Evento(eventData);
    /*
    event.save().catch(() => {
        return res.status(400).send("Failed to save event");
    });
    */

     var calendar = Calendar.findById({_id: eventData.calendar});
     event.save().then((calendar) => {
        
     Calendar.findByIdAndUpdate(calendar.owner,  
        {$push: {events: event}},
        {new:true}).then((user) => {
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
    Evento.findByIdAndUpdate( ObjectID(req.body._id) , {name: req.body.name, date: req.body.date, allDay: req.body.allDay, startTime:  req.body.startTime, endTime: req.body.endTime, location: req.body.location, description: req.body.description, owner: req.body.owner, calendar: req.body.calendar}).then((event) => {
        return res.status(200).send(event);
    }).catch((err) => {
        return res.status(400).send(err);
    });
});

//Get Event
eventRouter.get('/events/getevent', (req, res) => {

        Evento.findById( ObjectID(req.body.id)).then(event => {
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
    var event = Evento.findById(ObjectID(req.body.id));
    Evento.findByIdAndRemove(req.params.id).then((event) => {
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