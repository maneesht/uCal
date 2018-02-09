var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var Evento = require('../models/event').Evento;
const _ = require('lodash');
const app = require('../../server');
var q = require('q');


//route for creating a new user
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

	var user = new User(body);

    user.save()
        .then((user) => {
            //Create a new default calendar for the user as well
            var calendar = new Calendar({
                name: "Events",
                owner: user._id
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

app.patch('/users/:userID', (req, res) => {
    //Mainly to be used in updating a users password
    //TODO: validate that the user requesting this is the user in userID
    var newPassword = _.pick(req.body, ['password']).password;

    User.findByIdAndUpdate(req.params.userID, {$set: {password: newPassword}}).then((user) => {
        return res.status(200).send("Password Updated Successfully");
    }).catch((err) => {
        return res.status(400).send("Failed to Update Password");
    });
});

app.get('/users/:userID', (req, res) => {
    //Get the users calendars, events, groups, and friends
    var data = {
        userID: req.params.userID,
        groups: [],
        calendars: [],
        friends: []
    }
    User.findById(req.params.userID).then((user) => {
        var promises = [];
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

function getUser(userData) {
    return User.User.findOne(userData);
}
