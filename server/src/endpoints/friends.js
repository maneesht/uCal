var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var UEvent = require('../models/event').UEvent;
const _ = require('lodash');
const q = require('q');
let express = require('express');
const verifyToken = require('../token-handler').verifyToken;

let friendRouter = express.Router();
friendRouter.post('/users/friends/:friendID', verifyToken, (req, res) => {
    let userID = req.decoded.user._id;
    //Create a friend request from userID to friendID
    User.findById(req.params.friendID).then((users) => {
        if (users == null) throw "NotFound";
        for (let x = 0; x < users.friends.length; x++) {
            if (users.friends[x] == userID) {
                return res.status(400).send("Already friends");
            };
        };
        User.findByIdAndUpdate(req.params.friendID, {$addToSet : {friendRequests: userID}}).then(() =>{
            return res.status(200).send("Friend request sent");
        }).catch(() => {
            return res.status(400).send("Failed to send friend request")
        });
    }).catch(() => {
        return res.status(404).send("User not Found")
    });
});

friendRouter.delete('/users/friends/:friendID', verifyToken, (req, res) => {
    //Remove the friendship between userId and friendID
    let userID = req.decoded.user._id;
    User.findByIdAndUpdate(userID, { $pull: { friends: req.params.friendID } }, { new: true }).then((user) => {
        User.findByIdAndUpdate(req.params.friendID, { $pull: { friends: user._id } }).then((friend) => {
            return res.status(200).send("Removed Friend");
        }).catch((err) => {
            return res.status(400).send("Some Error with friendRouter");
        });
    }).catch((err) => {
        return res.status(400).send("Some Error friendRouter");
    });
});

friendRouter.patch('/users/friends/:friendID', verifyToken, (req, res) => {
    //Accept or decline a friend request
    //userID is accepting or declining friendID has sent the request
    var accept = _.pick(req.body, ['accept']).accept;
    let userID = req.decoded.user._id;

    if (accept == undefined)
        return res.status(400).send("Required field 'accept: boolean' not specified");

    if (accept) {
        User.findByIdAndUpdate(userID, { $push: { friends: req.params.friendID }, $pull: { friendRequests: req.params.friendID } }, { new: true }).then((user) => {
            User.findByIdAndUpdate(req.params.friendID, { $push: { friends: user._id } }).then((friend) => {
                return res.status(200).send("Friend Request Accepted");
            }).catch((err) => {
                console.error(err);
            });
        }).catch((err) => {
            return res.status(404).send("No friend request exists between these users")
        })
    } else {
        User.findOneAndUpdate({_id: userID, friendRequests: req.params.friendID}, {$pull: {friendRequests: req.params.friendID}}, {new: true}).then((user) => {
            if (user == null)
                throw "NotFound"
            return res.status(200).send("Successfully declined friend request");
        }).catch((err) => {
            return res.status(404).send("No friend request exists between these users")
        });
    };
});

friendRouter.get('/users/pending-friends', verifyToken, (req, res) => {
    let userID = req.decoded.user._id;
    User.findById(userID).then((user) => {
        if (user == null)
            throw "NotFound"
        return res.status(200).send(user.friendRequests);
    }).catch(() => {
        return res.status(404).send("User not found");
    });
});

friendRouter.get('/users/friends', verifyToken, (req, res) => {
    let userID = req.decoded.user._id;
    User.findById(userID).then((user) => {
        return res.status(200).send(user.friends);
    }).catch(() => {
        return res.status(404).send("User not found");
    });
});
module.exports = friendRouter;
