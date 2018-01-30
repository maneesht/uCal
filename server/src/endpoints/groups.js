let User = require('../models/user').User;
let Calendar = require('../models/calendar');
let Group = require('../models/group').Group;
let UEvent = require('../models/event');
let express = require('express');
const { verifyToken } = require('../token-handler');
const _ = require('lodash');

let groupRoutes = express.Router();
groupRoutes.use(verifyToken); //makes sure tokens are valid
groupRoutes.post('/accept', (req, res) => {
    //Accept an Invitation to a Group
    let user = _.pick(req.body, [user]);
    let group = _.pick(req.body, [groupId]);
    User.findByCredentials(user).then((user) => {
        Group.findOne({
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

groupRoutes.post('/create', (res, req) => {
    //Create a new Group (N.B. You cannot invite people here)
    let user = _.pick(res.body, [user]);
    let group = _.pick(res.body, [group]);
    User.findByCredentials(user).then((user) => {
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

groupRoutes.post('/decline', (res, req) => {
    //Decline Invitation to Group
    let user = _.pick(res.body, [user]);
    let group = _.pick(res.body, [group]);
    User.findByCredentials(user).then((user) => {
        Group.findOne({
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

groupRoutes.post('/leave', (res, req) => {
    //Leave a Group
    let user = _.pick(res.body, [user]);
    let group = _.pick(res.body, [group]);
    User.findByCredentials(user).then((user) => {
        Group.findOne({
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

groupRoutes.post('/invite', (res, req) => {
    
});
function inviteToGroup(user, groupId, invited) {
    let user = User.findByCredentials(user);
    let group = Group.findOne({_id: groupId, members: {$elemMatch: user._id}});
    group.members.push(invited);
    return group;
}

groupRoutes.post('/groups/remove', (res, req) => {
    let owner = _.pick(res.body, [user]);
    let group = _.pick(res.body, [group]);
    let user = _.pick(res.body, [toRemove]);
    User.findByCredentials(owner).then((owner) => {
        Group.findOne({
            _id: group._id,
            owner: owner._id,
            members: {$elemMatch: user._id}
        }).then((group) => {
            group.members.remove(user._id);
            group.save().then(() => {
                User.findOneAndUpdate({_id: user._id}, {$pull: {groups: group._id}}).then(() => {
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
module.exports = { groupRoutes };
