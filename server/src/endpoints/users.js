var User = require('../models/user').User;
var Group = require('../models/group');

var Calendar = require('../models/calendar').Calendar;
var UEvent = require('../models/event').UEvent;
let express = require('express');
const _ = require('lodash');
var q = require('q');

let userRouter = express.Router();

//route for creating a new user
userRouter.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    if (body['email'] == undefined || body['password'] == undefined)
        return res.status(400).send("Required Fields Unspecified");
    
    //Regular Expression for finding email addresses
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (!re.test(body['email']))
        return res.status(400).send("email not a correct email format");

	var user = new User(body);

    user.save()
        .then(() => {
            return res.status(200).send("account created for: " + body.email);
        }).catch((err) => {
            return res.status(400).send(err);
        });
});

//route for validating a user's credentials
userRouter.post('/users/validate', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            return res.status(200).send(user);
        }).catch((err) => {
            return res.status(400).send(err);
        });
});

//route for finding a user by it's email
userRouter.post('/users/find', (req, res) => {
    var body = _.pick(req.body, ['email']);

    User.findByEmail(body.email)
        .then((user) => {
            return res.status(200).send(user);
        }).catch((err) => {
            return res.status(400).send(err);
        });
});

//route for updating a user email
userRouter.post('/users/email/update', (req, res) => {
    var body = _.pick(req.body, ['email', 'password', 'newEmail']);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            user.email = body.email

            user.save()
                .then(() => {
                    return res.status(200).send("updated the email to: " + body.newEmail);
                }).catch((err) => {
                    //couldn't update the user
                    return res.status(400).send(err);
                });
        }).catch((err) => {
            //couldn't find the user
            return res.status(400).send(err);
        });

});

//route for updating a user password
userRouter.post('/users/password/update', (req, res) => {
    var body = _.pick(req.body, ['email', 'password', 'newPassword']);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            user.password = body.newPassword

            user.save()
                .then(() => {
                    return res.status(200).send("updated the password to: " + body.newPassword);
                }).catch((err) => {
                    //couldn't update the user
                    return res.status(400).send(err);
                });
        }).catch((err) => {
            //couldn't find the user
            return res.status(400).send(err);
        });

});

//route for getting a user's calendars
userRouter.post('/users/calendars/get', (req, res) => {
    var body = _.pick(req.body, ['email']);

    User.findByEmail(body.email)
        .then((user) => {
            return res.status(200).send(user.calendars);
        }).catch((err) => {
            //user couldn't be found
            return res.status(400).send(err);
        });

});

//route for adding a calendar to a user
userRouter.post('/users/calendars/add', (req, res) => {
    var body = _.pick(req.body, ['email', 'calendar', 'edit']);

    User.findByEmail(body.email)
        .then((user) => {
            let calendar = {
                calendarId: body.calendar,
                edit: body.edit
            }
            user.calendars.push(calendar)
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
                        User.findByIdAndUpdate(user._id, { $push: { calendars: { _id: calendar._id, edit: true } } }, { new: true }).then((user) => {
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
});

userRouter.patch('/users/:userID', (req, res) => {
    //Mainly to be used in updating a users password
    //TODO: validate that the user requesting this is the user in userID
    var newPassword = _.pick(req.body, ['password']).password;

    User.findByIdAndUpdate(req.params.userID, { $set: { password: newPassword } }).then((user) => {
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
                    UEvent.findById(calendar.events[y]).then((event) => {
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
            }).catch(() => {
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

//route for getting a user's groups
userRouter.post('/users/groups/get', (req, res) => {
    var body = _.pick(req.body, ['email']);

    User.findByEmail(body.email)
        .then((user) => {
            return res.status(200).send(user.groups);
        }).catch((err) => {
            //user couldn't be found
            return res.status(400).send(err);
        });

});

//route for adding a group to a user
userRouter.post('/users/groups/add', (req, res) => {
    var body = _.pick(req.body, ['email', 'group']);

    User.findByEmail(body.email)
        .then((user) => {
            user.groups.push(body.group)

            user.save()
                .then(() => {
                    return res.status(200).send(`successfully added ${body.group} to ${body.email}'s groups'`);
                }).catch((err) => {
                    //couldn't update the user
                    return res.status(400).send(err);
                });
        }).catch((err) => {
            //couldn't find the user
            return res.status(400).send(err);
        });
});

//route for getting a user's friends
userRouter.post('/users/friends/get', (req, res) => {
    var body = _.pick(req.body, ['email']);

    User.findByEmail(body.email)
        .then((user) => {
            return res.status(200).send(user.calendars);
        }).catch((err) => {
            //user couldn't be found
            return res.status(400).send(err);
        });

});

//route for adding a friend to a user
userRouter.post('/users/friends/add', (req, res) => {
    var body = _.pick(req.body, ['email', 'friend']);

    User.findByEmail(body.email)
        .then((user) => {
            user.friends.push(body.friend)

            user.save()
                .then(() => {
                    return res.status(200).send(`successfully added ${body.friend} to ${body.email}'s groups'`);
                }).catch((err) => {
                    //couldn't update the user
                    return res.status(400).send(err);
                });
        }).catch((err) => {
            //couldn't find the user
            return res.status(400).send(err);
        });
});
userRouter.delete('/users/:userID', (req, res) => {
    User.findByIdAndRemove(req.params.userID).then((user) => {

        for (var x = 0; x < user.groups.length; x++) {
            Group.findById(user.groups[x]).then((group) => {
                if (group.owner.equals(user._id)) {
                    for (var y = 0; y < group.invited.length; y++) {
                        User.findByIdAndUpdate(group.invited[y], { $pull: { groupinvites: group._id } });
                    }
                    for (var y = 0; y < group.members.length; y++) {
                        User.findByIdAndUpdate(group.members[y], { $pull: { groups: group._id } });
                    }
                    for (var y = 0; y < group.calendars.length; y++) {
                        Calendar.findByIdAndRemove(group.calendars[y]).then((calendar) => {
                            for (var z = 0; z < calendar.events.length; z++) {
                                UEvent.findByIdAndRemove(calendar.events[z]);
                            };
                        });
                    };
                } else {
                    Group.findByIdAndUpdate(group._id, { $pull: { members: user._id } });
                };
            });
            Group.findByIdAndUpdate(user.groups[x], { $pull: { members: user._id } });
        };

        for (var x = 0; x < user.groupinvites.length; x++) {
            Group.findByIdAndUpdate(user.groupInvites[x], { $pull: { invited: user._id } });
        };

        for (var x = 0; x < user.friends.length; x++) {
            User.findByIdAndUpdate(user.friends[x], { $pull: { friends: user._id } });
        };

        for (var x = 0; x < user.calendars.length; x++) {
            Calendar.findById(user.calendars[x]).then((calendar) => {
                if (calendar.owner = user._id) {
                    for (var y = 0; y < calendar.users.length; y++) {
                        User.findByIdAndUpdate(calendar.users[y], { $pull: { calendars: calendar._id } });
                    }
                    Calendar.findByIdAndRemove(calendar._id).then((calendar) => {
                        for (var z = 0; z < calendar.events.length; z++) {
                            UEvent.findByIdAndRemove(calendar.events[z]);
                        };
                    });
                } else {
                    Calendar.findByIdAndUpdate(calendar._id, { $pull: { users: user._id } });
                };
            });
        };

        return res.status(202).send(`User ${req.params.userID} has been marked for deletion`)
    }).catch(() => {
        return res.status(404).send(`User with ID ${req.params.userID} not found`);
    });
});
userRouter.post('/users/find', (req, res) => {
    var body = _.pick(req.body, ['email']);

    User.findByEmail(body.email)
        .then((user) => {
            res.status(200).send(user);
        }).catch((err) => {
            res.status(400).send(err);
        });
});
module.exports = userRouter;
