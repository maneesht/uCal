var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var Evento = require('../models/event').Evento;
const _ = require('lodash');
const q = require('q');
let express = require('express');

let friendRouter = express.Router();
friendRouter.post('/users/:userID/friends/:friendID', (req, res) => {
    //Create a friend request from userID to friendID
    User.findByIdAndUpdate(req.params.friendID, { $addToSet: { friendRequests: req.params.userID } }).then((users) => {
        return res.status(200).send("Friend request sent");
    }).catch(() => {
        console.error(err);
        return res.status(400).send("Failed to send friend request")
    });
});

friendRouter.delete('/users/:userID/friends/:friendID', (req, res) => {
    //Remove the friendship between userId and friendID
    User.findByIdAndUpdate(req.params.userID, { $pull: { friends: req.params.friendID } }, { new: true }).then((user) => {
        User.findByIdAndUpdate(req.params.friendID, { $pull: { friends: user._id } }).then((friend) => {
            return res.status(200).send("Removed Friend");
        }).catch((err) => {
            console.error(err);
            return res.status(400).send("Some Error hfriendRouterened");
        });
    }).catch((err) => {
        console.error(err);
        return res.status(400).send("Some Error hfriendRouterened");
    });
});

friendRouter.patch('/users/:userID/friends/:friendID', (req, res) => {
    //Accept or decline a friend request
    //userID is accepting or declining friendID has sent the request
    var accept = _.pick(req.body, ['accept']).accept;
    if (accept) {
        User.findByIdAndUpdate(req.params.userID, { $push: { friends: req.params.friendID }, $pull: { friendRequests: req.params.friendID } }, { new: true }).then((user) => {
            User.findByIdAndUpdate(req.params.userID, { $push: { friends: user._id } }).then((friend) => {
                return res.status(200).send("Friend Request Accepted!");
            }).catch((err) => {
                console.error(err);
            });
        }).catch((err) => {
            console.error(err);
        })
    } else {
        User.findByIdAndUpdate(req.params.userID, { $pull: { friendRequests: req.params.friendID } }).then((user) => {
            return res.status(200).send("Successfully declined friends request");
        }).catch((err) => {
            console.error(err);
            return res.status(400).send("Failed to decline request");
        });
    };
});
module.exports = friendRouter;