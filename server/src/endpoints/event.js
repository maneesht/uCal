var User = require('../models/user');
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var UEvent = require('../models/event').UEvent;

function createEvent(eventData) {
    var event = {
        //Put data here
    };
    event.save(function (err) { //not 100% sure if that's right
        if (err) throw err;
        console.log("Event created");
    });
    var calendar = Calendar.Calendar.findOne({_id: eventData.calendar});
    calendar.events.push(event);
    calendar.save(function (err) {
        if (err) throw err;
        console.log("Calendar Updated");
    });
}

function updateEvent(eventData) {
    UEvent.findOneAndUpdate({_id: eventData._id}, eventData, function (err) {
        if (err) throw err;
        console.log("Event updated successfully");
    });
}