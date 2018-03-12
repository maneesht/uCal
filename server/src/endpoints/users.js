var User = require('../models/user').User;
var Group = require('../models/group').Group;

var Calendar = require('../models/calendar').Calendar;
var UEvent = require('../models/event').UEvent;
let LocalStrategy = require('passport-local');
let passport = require('passport');
let express = require('express');
let jwt = require('jsonwebtoken');
let secretKey = require('../config/config').key;
const _ = require('lodash');
const verifyToken = require('../token-handler').verifyToken;
var q = require('q');

let userRouter = express.Router();
userRouter.post('/signup', (req, res, next) => {
    console.log('data')
    passport.authenticate('local-signup', function (err, user, info) {
        if (err) { return res.status(401).send(err); }
        if (!user) { return res.status(401).send(info); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            let token = jwt.sign({ user }, secretKey, {
                expiresIn: '2 days'
            });
            return res.send({ message: "Success!", token: token });
        });
    })(req, res, next);
});

userRouter.get('/current-user', verifyToken, (req, res) => {
    let user = req.decoded.user;
    res.send(user);
});

//route for creating a new user
passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
},
    function (req, email, password, done) {
        if (!email || !password)
            return done("Required Fields Unspecified");

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function () {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email': email }, function (err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                //Regular Expression for finding email addresses
                var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                if (!re.test(email))
                    return done("email not a correct email format");
                if(user) {
                    return done(null, false, req.flash('signupMessage', 'Email already taken'));
                }

                var newUser = new User({email, password});

                newUser.save()
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
                                done(null, user);
                            }).catch((err) => {
                                done("Failed to save default calendar to user");
                            });
                        }).catch(() => {
                            done("User created but default calendar creation failed.");
                        });
                    }).catch((err) => {
                        console.log(err);
                        done("Account already exists for: " + email);
                    });
            });
        });
    }));



//route for validating a user's credentials
/*userRouter.post('/users/validate', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            return res.status(200).send(user);
        }).catch((err) => {
            return res.status(400).send(err);
        });
});*/

//route for finding a user by it's email
//TODO: change to GET
userRouter.post('/users/find', verifyToken, (req, res) => {
    let email = req.decoded.user.email;

    User.findByEmail(email)
        .then((user) => {
            return res.status(200).send(user);
        }).catch((err) => {
            return res.status(400).send({text: "Could not find user"});
        });
});

//route for updating a user email
userRouter.post('/users/email/update', verifyToken, (req, res) => {
    let email = req.decoded.user.email;
    var body = _.pick(req.body, ['email', 'password', 'newEmail']);

    User.findByCredentials(email, body.password)
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
userRouter.post('/users/password/update', verifyToken, (req, res) => {
    var body = _.pick(req.body, [ 'password', 'newPassword']);
    let email = req.decoded.user.email;

    User.findByCredentials(email, body.password)
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
userRouter.get('/users/calendars/get', verifyToken, (req, res) => {
    let email = req.decoded.user.email;
    User.findByEmail(email)
        .then((user) => {
            return res.status(200).send(user.calendars);
        }).catch((err) => {
            //user couldn't be found
            return res.status(400).send(err);
        });

});

//route for adding a calendar to a user
userRouter.post('/users/calendars/add', verifyToken, (req, res) => {
    var body = _.pick(req.body, ['email', 'calendar', 'edit']);
    let email = req.decoded.user.email;
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
//ADDED TOKEN
userRouter.patch('/users/', verifyToken, (req, res) => {
    //Mainly to be used in updating a users password
    //TODO: validate that the user requesting this is the user in userID
    var newPassword = _.pick(req.body, ['password']).password;

    User.findByIdAndUpdate(req.decoded.user._id, { $set: { password: newPassword } }).then((user) => {
        return res.status(200).send("Password Updated Successfully");
    }).catch((err) => {
        return res.status(400).send("Failed to Update Password");
    });
});

userRouter.get('/user/get-email/:userId', (req, res) => {
    User.findById(req.params.userId).then((user) => {
        res.send({ _id: user._id, email: user.email });
    }).catch(err => res.status(400).send(err));
});

//ADDED TOKEN
userRouter.get('/users',verifyToken, (req, res) => {
    //Get the users calendars, events, groups, and friends
    var data = {
        email: '',
        userId: req.decoded.user._id,
        groups: [],
        calendars: [],
        friends: []
    }
    //console.log(req.decoded.user._id);
    
    User.findById(req.decoded.user._id).then((user) => {
        var promises = [];
        data.email = user.email;
        for (var x = 0; x < user.groups.length; x++) {
            promises.push(Group.findById(user.groups[x]).then((group) => {
                data.groups.push(group);
            }).catch(() => {
                return res.status(400).send("A error occurred while processing request.");
            }));
        }
        for (var x = 0; x < user.calendars.length; x++) {
            promises.push(Calendar.findById(user.calendars[x]._id).then((calendar) => {
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
    }).catch((err) => {
        return res.status(404).send(`User with ID ${req.params.userID} not Found`);
    });
    
   return res.status(404);
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
//TODO: change to /GET
userRouter.post('/users/friends/get', (req, res) => {
    var body = _.pick(req.body, ['email']);
    let email = req.decoded.user.email;
    User.findByEmail(email)
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
userRouter.delete('/users', verifyToken, (req, res) => {
    User.findByIdAndRemove(req.decoded.user._id).then((user) => {

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
userRouter.get('/users/search/:userID', verifyToken, (req, res) => {
    var userID = req.params.userID;
    User
        .find({ $text: { $search: userID}})
        .limit(5)
        .exec((err, results) => {
            if(results) {
                let updatedResults = results.map(user => ({ _id: user._id, email: user.email }));
                res.send(updatedResults);
            } else {
                res.send([]);
            }
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
