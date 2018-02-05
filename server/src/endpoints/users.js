var User = require('../models/user').User;
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var Event = require('../models/event');
const { mongoose, mongoUrl } = require('./src/database/mongoose');
const { ObjectID } = require('mongodb');

function userCreated(err) {
    if (err) 
        throw err;
    else    
        console.log("User Created Successfully");
}

function userUpdated(err) {
    if (err)
        throw err;
    else    
        console.log("User Updated Successfully");
}

function createUser(userData) {
    //TODO parse data passed here to make sure it is valid.
    var user = new User(
        //TODO put USER info here
    );
    user.save(userCreated);
    var defaultCalendar = new Calendar({
        name: 'Events',
        owner: user._id
    });
    defaultCalendar.save(function(err) {
        if (err)
            throw err;
        else
            console.log("Default Calendar Created");
    })
    user.calendars.push(defaultCalendar)
    user.save(userUpdated);
}

function updateUser(userData) {
    User.User.findOneAndUpdate({_id: userData._id}, userData, userUpdated());
}

function getUser(userData) {
    return User.User.findOne(userData);
}
