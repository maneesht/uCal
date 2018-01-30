var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var Evento = require('../models/event').Evento;
const _ = require('lodash');
const express = require('express');
const q = require('q');

const calendarRouter = express.Router();
calendarRouter.post('/users/:userID/calendars', (req, res) => {
    //Create a calendar for a user
    var calendarData = _.pick(req.body, ['calendar']).calendar;

    var calendar = new Calendar({
        name: calendarData.name,
        description: (description in calendarData) ? calendarData.description : '',
        owner: req.params.userID,
        users: [req.params.userID]
    });

    calendar.save().then((calendar) => {
        User.findByIdAndUpdate(calendar.owner, {$push: {calendars: calendar._id}}).then((user) => {
            return res.status(200).send(calendar);
        }).catch(() => {
            return res.status(400).send("Failed to save calendar to user");
        });
    }).catch(() => {
        return res.status(400).send("Failed to make calendar");
    });
});

calendarRouter.post('/groups/:groupID/calendars', (req, res) => {
    //Create a calendar for a group
    var calendarDAta = _.pick(req.body, ['calendar']).calendar;

    Group.findById(req.params.groupID).then((group) => {
        var calendar = new Calendar({
            name: calendarData.name,
            description: (description in calendarData) ? calendarData.description : '',
            owner: group.owner,
            users: group.members
        });
        Calendar.save().then((calendar) => {
            var promises = [];
            for (var x = 0; x < calendar.users; x++) {
                promises.push(User.findByIdAndUpdate(calendar.users[x], {$push: {calendars: {calendarId: calendar._id, edit: true}}}).then(() => {
                    //pass
                }).catch((err) => {
                    console.error(err);
                }));
            };
            q.all(promises).then(() => {
                return res.status(200).send(calendar);
            });
        }).catch((err) => {
            console.log(err);
            return res.status(400).send("Failed to create group calendar");
        });
    }).catch((err) => {
        console.error(err);
        return res.status(404).send("Group not Found");
    }); 
});

calendarRouter.delete('/calendars/:calendarID', (req, res) => {
    //delete a calendar
    Calendar.findByIdAndRemove(req.params.calendarID).then((calendar) => {
        for (var x = 0; x < calendar.events.length; x++) {
            Evento.findByIdAndRemove(calendar.events[x]).catch((err) => {
                console.error(err);
            });
        }
        //TODO FINISH
    }).catch((err) => {
        return res.status(400).send("Failed to delete calendar");
    })
});

calendarRouter.get('/calendars/:calendarID', (req, res) => {
    Calendar.findById(req.params.calendarID).then((calendar) => {
        var data = {
            name: calendar.name,
            description: calendar.description,
            owner: calendar.owner,
            events: []
        };
        var promises = [];
        for (var x = 0; x < calendar.events.length; x++) {
            promises.push(Evento.findById(calendar.events[x]).then((event)=>{
                data.events.push(event);
            }).catch((err) => {
                console.error(err);
            }))
        };  
        q.all(promises).then(() => {
            return res.status(200).send(data)
        });
    }).catch(() => {
        return res.status(404).send("Calendar not Found");
    })
});

calendarRouter.patch('/calendars/:calendarID', (req, res) => {
    //update calendar information (name, description)
    var updated = _.pick(req.body, ['calendar']).calendar;
    var data = {};
    if (name in updated) {
        data['name'] = updated.name;
    };
    if (description in updated) {
        data['description'] = updated.description;
    };
    Calendar.findByIdAndUpdate(req.params.calendarID, data).then((calendar) => {
        return res.status(200).send(calendar);
    }).catch(() => {
        return res.status(400).send("Failed to update calendar");
    });
});

calendarRouter.patch('/calendars/:calendarID/share', (req, res) => {
    //Share the calendar to other users
    var user = _.pick(req.body, ['users']).users;
    var editable = _.pick(req.body, ['edit']).edit;
    Calendar.findByIdAndUpdate(req.params.calendarID, {$addToSet: {users: {$each: user}}}, {new: true}).then((calendar) => {
        var promises = []
        for (var x = 0; x < user.length; x++) {
            promises.push(User.findByIdAndUpdate(user[x], {$addToSet: {calendars: {calendarId: calendar._id, edit: editable}}}).then((user) => {
                //pass
            }).catch((err) => {
                console.error(err);
            }));
        }
        q.all(promises).then(() => {
            return res.status(200).send("Shared Calendars with users")
        })
    }).catch((err) => {
        console.error(err);
        return res.status(400).send("Failed to share calendar")
    });
});

module.exports = calendarRouter;
