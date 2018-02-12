var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var Evento = require('../models/event').Evento;
let express = require('express');
const _ = require('lodash');
var q = require('q');

let userRouter = express.Router();

//route for creating a new user
userRouter.post('/users/create', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    if (body['email'] == undefined || body['password'] == undefined)
        return res.status(400).send("Required Fields Unspecified");

    //Regular Expression for finding email addresses
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!re.test(body['email']))
        return res.status(400).send("email not a correct email format");

	console.log(body);
	var user = new User(body);
	console.log(user);

	//TODO duplicate emails are still allowed?

    user.save()
        .then((user) => {
            //Create a new default calendar for the user as well
            var calendar = new Calendar({
                name: "Events",
                owner: user._id,
                users: [
                    user._id
                ]
            });
            calendar.save().then((calendar) => {
                User.findByIdAndUpdate(user._id, {$push: {calendars: {_id: calendar._id, edit: true}}}, {new: true}).then((user) => {
                    return res.status(200).send(user);
                }).catch((err) => {
                    return res.status(400).send("Failed to save default calendar to user");
                });
            }).catch(() => {
                return res.status(400).send("User created but default calendar creation failed.")
            });
        }).catch((err) => {
            res.status(400).send("Account already exists for: " + body.email);
        });
});

userRouter.patch('/users/:userID', (req, res) => {
    //Mainly to be used in updating a users password
    //TODO: validate that the user requesting this is the user in userID
    var newPassword = _.pick(req.body, ['password']).password;

    User.findByIdAndUpdate(req.params.userID, {$set: {password: newPassword}}).then((user) => {
        return res.status(200).send("Password Updated Successfully");
    }).catch((err) => {
        return res.status(400).send("Failed to Update Password");
    });
});

userRouter.get('/users/:userID', (req, res) => {
    //Get the users calendars, events, groups, and friends
    var data = {
        email: '',
        userId: req.params.userID,
        groups: [],
        calendars: [],
        friends: []
    }
    User.findById(req.params.userID).then((user) => {
        var promises = [];
        data.email = user.email;
        for (var x = 0; x < user.groups.length; x++) {
            promises.push(Group.findById(user.groups[x]).then((group) => {
                data.groups.push(group);
            }).catch(() => {
                return res.status(400).send("A error occurred while processing request.");
            }));
        };
        for (var x = 0; x < user.calendars.length; x++) {
            promises.push(Calendar.findById(user.calendars[x]).then((calendar) => {
                data.calendars.push({
                    name: calendar.name,
                    description: calendar.description,
                    owner: calendar.owner,
                    events: []
                });
                for (var y = 0; y < calendar.events.length; y++) {
                    Evento.findById(calendar.events[y]).then((event) => {
                        data.calendars[x].events.push(event);
                    }).catch(() => {
                        return res.status(400).send("A error occurred while processing request.");
                    });
                };
            }).catch(() => {
                return res.status(400).send("A error occurred while processing request.");
            }));
        };
        for (var x = 0; x < user.friends.length; x++) {
            promises.push(User.findById(user.friends[x]).then((friend) => {
                data.friends.push({
                    friendID: friend._id,
                    email: friend.email
                });
            }).catch(() =>{
                return res.status(400).send("A error occurred while processing request.");
            }));
        };
        q.all(promises).then(() => {
            return res.status(200).send(data);
        });
    }).catch(() => {
        return res.status(404).send(`User with ID ${req.params.userID} not Found`);
    });
});

userRouter.delete('/users/:userID', (req, res) => {
    User.findByIdAndRemove(req.params.userID).then((user) => {

        for (var x = 0; x < user.groups.length; x++) {
            Group.findById(user.groups[x]).then((group) => {
                if (group.owner.equals(user._id)) {
                    for (var y = 0; y < group.invited.length; y++) {
                        User.findByIdAndUpdate(group.invited[y], {$pull: {groupinvites: group._id}});
                    }
                    for (var y = 0; y < group.members.length; y++) {
                        User.findByIdAndUpdate(group.members[y], {$pull: {groups: group._id}});
                    }
                    for (var y = 0; y < group.calendars.length; y++) {
                        Calendar.findByIdAndRemove(group.calendars[y]).then((calendar) => {
                            for (var z = 0; z < calendar.events.length; z++) {
                                Evento.findByIdAndRemove(calendar.events[z]);
                            };
                        });
                    };
                } else {
                    Group.findByIdAndUpdate(group._id, {$pull: {members: user._id}});
                };
            });
            Group.findByIdAndUpdate(user.groups[x], {$pull: {members: user._id}});
        };

        for (var x = 0; x < user.groupinvites.length; x++) {
            Group.findByIdAndUpdate(user.groupInvites[x], {$pull: {invited: user._id}});
        };

        for (var x = 0; x < user.friends.length; x++) {
            User.findByIdAndUpdate(user.friends[x], {$pull: {friends: user._id}});
        };

        for (var x = 0; x < user.calendars.length; x++) {
            Calendar.findById(user.calendars[x]).then((calendar) => {
                if (calendar.owner = user._id) {
                    for (var y = 0; y < calendar.users.length; y++) {
                        User.findByIdAndUpdate(calendar.users[y], {$pull: {calendars: calendar._id}});
                    }
                    Calendar.findByIdAndRemove(calendar._id).then((calendar) => {
                        for (var z = 0; z < calendar.events.length; z++) {
                            Evento.findByIdAndRemove(calendar.events[z]);
                        };
                    });
                } else {
                    Calendar.findByIdAndUpdate(calendar._id, {$pull: {users: user._id}});
                };
            });
        };

        return res.status(202).send(`User ${req.params.userID} has been marked for deletion`)
    }).catch(() => {
        return res.status(404).send(`User with ID ${req.params.userID} not found`);
    });
});
module.exports = userRouter;
