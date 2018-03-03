var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var UEvent = require('../models/event').UEvent;
const _ = require('lodash');
const express = require('express');
const q = require('q');
const verifyToken = require('../token-handler').verifyToken;
const { ObjectID } = require('mongodb');

const calendarRouter = express.Router();
calendarRouter.post('/users/:userID/calendars', (req, res) => {
    //Create a calendar for a user
    var calendarData = _.pick(req.body, ['calendar']).calendar;
    
    if(typeof calendarData == "undefined") {
        return res.status(400).send("No calendar data was supplied");
    }    
    
    if(typeof calendarData.name == "undefined") {
        return res.status(400).send("No name value was given");
    }

    var id = req.params.userID;
    var calendar = new Calendar({
        name: calendarData.name,
        description: calendarData.description || "",
        owner: id,
        users: [id]
    });
    


    calendar.save().then((calendar) => {
        User.findByIdAndUpdate(calendar.owner, { $push: { calendars: calendar._id } }).then((user) => {
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
    var calendarData = _.pick(req.body, ['calendar']).calendar;

    if(typeof calendarData == "undefined") {
        return res.status(400).send("No calendar data was supplied");
    }    
    
    if(typeof calendarData.name == "undefined") {
        return res.status(400).send("No name value was given");
    }

    Group.findById(req.params.groupID).then((group) => {

        if( group == null) {
            throw "";
        }

        var calendar = new Calendar({
            name: calendarData.name,
            description: calendarData.description || "",
            owner: group.owner,
            users: group.members,
			group: req.params.groupID
        });
        calendar.save().then((calendar) => {
            var promises = [];
            for (var x = 0; x < calendar.users; x++) {
                promises.push(User.findByIdAndUpdate(calendar.users[x], { $push: { calendars: { calendarId: calendar._id, edit: true } } }).then(() => {
                    //pass
                }).catch((err) => {
                    console.error(err);
                }));
            };
            q.all(promises).then(() => {
                return res.status(200).send(calendar);
            });
        }).catch((err) => {
            console.error(err);
            return res.status(400).send("Failed to create group calendar");
        });
    }).catch((err) => {
        console.error(err);
        return res.status(404).send("Group not Found");
    });
});

calendarRouter.delete('/calendars/:calendarID', (req, res) => {
    //delete a calendar
   // console.log(req.params.calendarID)
    Calendar.findByIdAndRemove(req.params.calendarID).then((calendar) => {
        for (var x = 0; x < calendar.events.length; x++) {
           UEvent.findByIdAndRemove(calendar.events[x]).catch((err) =>{
                return res.status(400).send("error removing events from calendar")
           })
        }
        //console.log(calendar);
        User.findById(calendar.owner).then((user) => {
           // console.log("User: " + user)
            var index = -1;
            for(var i = 0; i < user.calendars.length; i++) {
                
                if(ObjectID(user.calendars[i].calendarId) == ObjectID(calendar._id)) {
                    index = i;
                    break;
                }
            }
            //console.log("Calendar: " + calendar)
            //var index = user.calendars.indexOf(ObjectID(calendar._id));
            //var index2 = user.calendars.indexOf(calendar.calendarId)
            //console.log(index2);
            if (index !== -1) {
                user.calendars.splice(index, 1);
            } 

            //else if (index2 !== -1) {
            //    user.calendars.splice(index2, 1);
            //}

            User.findById((user._id))
                .then((user) => {
                    user.calendars.push(user);

                    user.save().then((savedUser) => {
                            return res.status(200).send("Calendar deleted");
                        }).catch(() => {
                            return res.status(400).send("Failed to remove calendar from user");
                        });
                }).catch(() => {
                    return res.status(400).send("That user does not exist in here");
                });

        }).catch((err) => {
            return res.status(400).send("That user does not exist");
        });
        		//TODO remove the calendar from the owner's list of calendars

		//res.status(200).send(`Successfully deleted calendar ${req.params.calendarID}`);
    
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
            events: [],
			group: calendar.group,
			users: calendar.users
        };
        var promises = [];
        for (var x = 0; x < calendar.events.length; x++) {
            promises.push(UEvent.findById(calendar.events[x]).then((event)=>{
                data.events.push(event);
            }).catch((err) => {
                console.error(err);
            }))
        };
        q.all(promises).then(() => {
            return res.status(200).send(data);
        });
    }).catch(() => {
        return res.status(404).send("Calendar not Found");
    })
});

calendarRouter.patch('/calendars/:calendarID', (req, res) => {
    //update calendar information (name, description)
    var updated = _.pick(req.body, ['calendar']).calendar;
    if(typeof updated.name == "undefined") {
        return res.status(400).send("Invalid name value given");
    }
    if(Object.keys(updated).length > 2) {
        return res.status(400).send("Too many values inputted")
    }

    var data = {};
    if (updated.name) {
        data['name'] = updated.name;
    };
    if (updated.description) {
        data['description'] = updated.description;
    };
    Calendar.findByIdAndUpdate(req.params.calendarID, data, {new: true }).then((calendar) => {
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
                // console.error(err);
            }));
        }
        q.all(promises).then(() => {
			//changed the result to return the calendar so the test can verify
			return res.status(200).send(calendar)
            // return res.status(200).send("Shared Calendars with users")
        })
    }).catch((err) => {
        // console.error(err);
        return res.status(400).send("Failed to share calendar")
    });
});

calendarRouter.get('/calendars/', verifyToken, (req, res) => {
    //console.log(req.decoded);
    var currentUser = req.user;
    var calendars = [];
    //console.log(currentUser);
    User.findById(currentUser._id).then((user) => {
        for (var x = 0; x < user.calendars.length; x++) {
            calendars.concat(user.calendars[x]);
        }
        return res.status(200).send(calendars);
    }).catch(() => {
        return res.status(404).send("User not Found");
    });
});

//TODO add a route for changing owner?

//TODO add a route for sharing the calendar with a group

module.exports = calendarRouter;
