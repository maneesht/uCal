var User = require('../models/user');
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var Evento = require('../models/event');

function createCalendar(calendarData) {
    var calendar = new Calendar(calendarData);
    Calendar.Calendar.findOne({name: calendar.name, owner: calendar.owner}, function(err, res) {
        if (err || !res) 
            continue;
        else
            console.log(`Calendar ${calendar.name} already exists for user ${calendar.owner}`);
            //TODO figure out how to get out of here
    });
    let owner = User.User.findById(calendar.owner);
    calendar.save(function (err) {
        if (err)
            console.error(err);
        else
            console.log(`New calendar "${calendar.name}" created for user ${calendar.owner}`);
    });
    owner.calendars.push(calendar._id);
    owner.save(function (err) {
        if (err) console.error(err);
        else console.log("Calendar added to user");
    });
}

function deleteCalendar(calendarId) {
    Calendar.Calendar.findByIdAndRemove(calendarId);
}

function getCalendar(calendarId) {
    var calendar = Calendar.Calendar.findById(calendarId).lean();
}

function updateCalendar(calendarData) {
    //TODO
}