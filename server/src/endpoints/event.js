var User = require('../models/user');
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var UEvent = require('../models/event');
const _ = require('lodash');
const app = require ("../../server");


//Create Event
app.post('/events/create', (req, res) => {
    var eventData = _.pick(req.body, ['name', 'date', 'allday', 'startTime', 'endTime', 'location', 'description', 'creator', 'calendar']);
    var event = {
        //Put data here NOT Sure yet
        name: eventData.name,
        date: eventData.date,
        allDay: eventData.allDay,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        description: eventData.description,
        creator: creator._id,
        calendar: eventData.calendar
    };

    /*
    event.save().catch(() => {
        return res.status(400).send("Failed to save event");
    });
    */

     var calendar = Calendar.Calendar.findOne({_id: eventData.calendar});
     calendar.events.push(event);
     calendar.save().then((calendar) => {

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
app.post('/events/update', (req, res) => {
    var eventData = _.pick(req.body, ['name', 'date', 'allday', 'startTime', 'endTime', 'location', 'description', 'creator', 'calendar']);
    UEvent.findByIDAndUpdate(req.params.eventID, eventData).then((event) => {
        return res.status(200).send(event);
    }).then(() => {
        return res.status(400).send("Failed to update event");
    });
});

//Get Event
app.get('/events/get', (req, res) => {
    UEvent.findById(req.params.eventID).then((event) => {
        var data = {
            //Put data here NOT Sure yet
            name: event.name,
            date: event.date,
            allDay: event.allDay,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            description: event.description,
            creator: event.creator._id,
            calendar: event.calendar
        };      
        return res.status(200).send(data)
    }).catch(() => {
        return res.status(404).send("Event not Found");
    })
});

//Delete Event
app.delete('/events/:eventID', (req, res) => {
    var event = UEvent.findById(req.params.eventID);
    UEvent.findByIdAndRemove(req.params.eventID).then((event) => {
        //remove from calendar
        Calendar.findByIdAndUpdate(event.calendar._id, {$pull: {events: event._id}}).then((calendar) => {
            return res.status(200).send("event removed from calendar");
        });
    }).catch((err) => {
        return res.status(400).send("I hate Eli");
    })
});

//declineRSVP
//acceptRSVP
//noRSVP