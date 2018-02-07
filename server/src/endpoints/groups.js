var User = require('../models/user');
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var Evento = require('../models/event');
const _ = require('lodash');
const app = require('../../server');

app.post('/groups/accept', (req, res) => {
    //acceptInviteToGroup
    var user = _.pick(req.body, [user]);
    var group = _.pick(req.body, [groupId]);
    User.User.findByCredentials(user).then((user) => {
        Group.Group.findOne({
            _id: group._id,
            invited: {$elemMatch: user._id}
        }).then((group) => {
            group.invited.remove(user._id);
            group.members.push(user._id);
            group.save().then(() => {
                console.log("Successfully joined group");
                user.groupInvites.remove(group._id);
                user.groups.push(group._id);
                user.save().then(() => {
                    return res.status(200).send("Successfully updated user and group");
                }).catch(() => {
                    return res.status(418).send("Failed to update the user");
                });
            }).catch(() => {
                return res.status(400).send("Failed to update the user and group");
            });
        }).catch((err) => {
            return res.status(404).send("Group not Found");
        });
    }).catch((err) => {
        return res.status(401).send("Invalid Login");
    });
});

app.post('/groups/create', (res, req) => {
    //Cannot Invite people here
    var user = _.pick(res.body, [user]);
    var group = _.pick(res.body, [group]);
    User.User.findByCredentials(user).then((user) => {
        group = new Group(group);
        group.save().then(() => {
            return res.status(200).send("Group Created");
        }).catch(() => {
            return res.status(400).send("Failed to create group");
        });
    }).catch(() => {
        return res.status(401).send("Invalid Login");
    });
})

function declineInviteToGroup(user, groupId) {
    var user = User.User.findByCredentials(user);
    var group = Group.Group.findOne({
        _id: groupId,
        invited: {$elemMatch: user._id}
    });
    group.invited.remove(user._id);
    return group;
}

function deleteGroup(owner, groupId) {

}

function leaveGroup(user, groupId) {
    var user = User.User.findByCredentials(user);
    var group = Group.Group.findOne({
        _id: groupId,
        members: {$elemMatch: user._id}
    });
    group.members.remove(user._id);
    return group;
}

function inviteToGroup(user, groupId, invited) {
    var user = User.User.findByCredentials(user);
    var group = Group.Group.findOne({_id: groupId, members: {$elemMatch: user._id}});
    group.members.push(invited);
    return group;
}

function removeFromGroup(owner, groupId, userId) {
    var owner = User.User.findByCredentials(owner);
    var group = Group.Group.findOne({
        _id: groupId,
        creator: owner._id,
        members: {$elemMatch: userId}
    });
    group.members.remove(userId);
    var user = USer.User.findById(userId);
    user.groups.remove(groupId);
    group.save();
    user.save();
    return group;
}