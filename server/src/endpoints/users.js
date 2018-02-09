var User = require('../models/user').User;
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var Event = require('../models/event');
const _ = require('lodash');
const app = require('../../server');


//route for creating a new user
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

	var user = new User(body);

    user.save()
        .then((user) => {
            res.status(200).send(user);
        }).catch((err) => {
            res.status(400).send("Account already exists for: " + body.email);
        });
});

app.patch('/users/:userID', (req, res) => {
    var newPassword = _.pick(req.body, ['password']).password;

    User.findById(req.params.userID).then((user) => {
        user.password = newPassword;
        user.save().then((user) => {
            res.status(200).send("Password Updated Successfully");
        }).catch((err) => {
            res.status(400).send({message: err});
        });
    }).catch((err) => {
        res.status(400).send("Failed to Update Password");
    });
});

function updateUser(userData) {
    User.User.findOneAndUpdate({_id: userData._id}, userData, userUpdated());
}

function getUser(userData) {
    return User.User.findOne(userData);
}
