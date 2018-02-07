var User = require('../models/user');
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var Evento = require('../models/event');

function acceptInviteToGroup(user, groupId) {
    var user = User.User.findByCredentials(user);
    var group = Group.Group.findOne({
        _id: groupId,
        invited: {$elemMatch: user._id}
    });
    group.invited.remove(user._id);
    group.memebers.push(user._id);
}

function createGroup(creator, groupData) {
    var creator = User.User.findByCredentials(creator);
    var group = new Group({
        name: groupData.name,
        creator: creator._id
    });
}

function declineInviteToGroup(user, groupId) {
    var user = User.User.findByCredentials(user);
    var group = Group.Group.findOne({
        _id: groupId,
        invited: {$elemMatch: user._id}
    });
    group.invited.remove(user._id);
}

function deleteGroup(owner, groupId) {
    var owner = User.User.findByCredentials(owner);
    var group = Group.Group.findById(groupId);
    if (owner._id == group.creator)
        group.remove();
}

function leaveGroup() {

}

function inviteToGroup(user, groupId, invited) {
    var user = User.User.findByCredentials(user);
    var group = Group.Group.findOne({_id: groupId, members: {$elemMatch: user._id}});
    group.members.push(invited);
    group.save();
}

function removeFromGroup() {

}