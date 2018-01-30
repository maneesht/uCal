let User = require('../models/user').User;
let Calendar = require('../models/calendar');
let Group = require('../models/group').Group;
let Event = require('../models/event');
const _ = require('lodash');
const express = require('express');

let userRoutes = express.Router();
userRoutes.post('/find', (req, res) => {
    let body = _.pick(req.body, ['email']);

    User.findByEmail(body.email)
        .then((user) => {
            res.status(200).send(user);
        }).catch((err) => {
            res.status(400).send(err);
        });
});
userRoutes.post('/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password)
        .then((user) => {
            res.status(200).send(user);
        }).catch((err) => {
            res.status(400).send(err);
        });
});
//route for creating a new user
userRoutes.post('/signup', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    let user = new User(body);

    user.save()
        .then((user) => {
            res.status(200).send(user);
        }).catch((err) => {
            res.status(400).send("Account already exists for: " + body.email);
        });
});

userRoutes.patch('/:userID', (req, res) => {
    let newPassword = _.pick(req.body, ['password']).password;

    User.findById(req.params.userID).then((user) => {
        user.password = newPassword;
        user.save().then((user) => {
            res.status(200).send("Password Updated Successfully");
        }).catch((err) => {
            res.status(400).send({ message: err });
        });
    }).catch((err) => {
        res.status(400).send("Failed to Update Password");
    });
});

function updateUser(userData) {
    User.User.findOneAndUpdate({ _id: userData._id }, userData, userUpdated());
}

function getUser(userData) {
    return User.User.findOne(userData);
}
module.exports = { userRoutes };
