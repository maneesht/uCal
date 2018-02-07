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
    return group;
}

function createGroup(creator, groupData) {
    var creator = User.User.findByCredentials(creator);
    var group = new Group({
        name: groupData.name,
        creator: creator._id
    });
    return group;
}

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