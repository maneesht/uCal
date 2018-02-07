var User = require('../models/user');
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var Evento = require('../models/event');
const _ = require('lodash');
const app = require('../../server');

app.post('/groups/accept', (req, res) => {
    //Accept an Invitation to a Group
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
    //Create a new Group (N.B. You cannot invite people here)
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
});

app.post('/groups/decline', (res, req) => {
    //Decline Invitation to Group
    var user = _.pick(res.body, [user]);
    var group = _.pick(res.body, [group]);
    User.User.findByCredentials(user).then((user) => {
        Group.Group.findOne({
            _id: group._id,
            invited: {$elemMatch: user._id}
        }).then((group) => {
            group.invited.remove(user._id);
            group.save().then(() => {
                user.groupInvites.remove(group._id);
                user.save().then(() => {
                    return res.status(200).send("Invite Successfully Declined");
                }).catch(() => {
                    return res.status(400).send("Failed to update user");
                });
            }).catch(() => {
                return res.status(400).send("Failed to update user and group");
            });
        }).catch(() => {
            return res.status(404).send("Group not found");
        });
    }).catch(() => {
        return res.status(401).send("Invalid login");
    });
});

function deleteGroup(owner, groupId) {

}

app.post('/groups/leave', (res, req) => {
    //Leave a Group
    var user = _.pick(res.body, [user]);
    var group = _.pick(res.body, [group]);
    User.User.findByCredentials(user).then((user) => {
        Group.Group.findOne({
            _id: group.id,
            members: {$elemMatch: user._id}
        }).then((group) => {
            group.members.remove(user._id);
            group.save().then(() => {
                user.groups.remove(group._id);
                user.save().then(() => {
                    return res.status(200).send("Successfully left group");
                }).catch(() => {
                    return res.status(400).send("Failed to update user");
                });
            }).catch(() => {
                return res.status(400).send("Failed to update group and user");
            });
        }).catch(() => {
            return res.status(404).send("Group not found");
        });
    }).catch(() => {
        return res.status(401).send("Invalid Login");
    });
});

app.post('/groups/invite', (res, req) => {
    
});
function inviteToGroup(user, groupId, invited) {
    var user = User.User.findByCredentials(user);
    var group = Group.Group.findOne({_id: groupId, members: {$elemMatch: user._id}});
    group.members.push(invited);
    return group;
}

app.post('/groups/remove', (res, req) => {
    var owner = _.pick(res.body, [user]);
    var group = _.pick(res.body, [group]);
    var user = _.pick(res.body, [toRemove]);
    User.User.findByCredentials(owner).then((owner) => {
        Group.Group.findOne({
            _id: group._id,
            owner: owner._id,
            members: {$elemMatch: user._id}
        }).then((group) => {
            group.members.remove(user._id);
            group.save().then(() => {
                User.User.findOneAndUpdate({_id: user._id}, {$pull: {groups: group._id}}).then(() => {
                    return res.status(200).send("User successfully Removed from group");
                }).catch(() => {
                    return res.status(400).send("Failed to update user");
                });
            }).catch(() => {
                return res.status(400).send("Failed to update group and user");
            });
        }).catch(() => {
            return res.status(404).send("Group not found");
        });
    }).catch(() => {
        return res.status(401).send("Invalid Login");
    });
});
