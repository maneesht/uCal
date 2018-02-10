import { read } from 'fs';

var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var Evento = require('../models/event').Evento;
const _ = require('lodash');
const app = require('../../server');
const q = require('q');

app.patch('/user/:userId/groups/:groupID/accept', (req, res) => {
    //accept or decline a group invite
    var accept = _.pick(req.body, ['accept']).accept;
    if (accept) {
        Group.findOneAndUpdate({
            _id: req.params.groupID,
            $elemMatch: {invited: user._id}
        }, {
            $push: {members: user._id},
            $pull: {invited: user._id}
        }).then(() => {
            return res.status(200).send("User added to group");
        }).catch(() => {
            return res.status(400).send("Failed to add user to group");
        });
    } else {
        Group.findOneAndUpdate({
            _id: req.params.groupID,
            $elemMatch: {invited: user._id}
        }, {
            $pull: {invited: user._id}
        }).then(() => {
            return res.status(200).send("User declined invitation to group");
        }).catch(() => {
            return res.status(400).send("Failed to decline invitation to group");
        });
    };
});

app.patch('/groups/:groupID/invite', (req, res) => {
    //Invite users to the group
    var invites = _.pick(req.body, ['users']).users;

    Group.findById(req.params.groupID, {$addToSet: {invited: {$each: invites}}}, {new: true}).then((group) => {
        for (var x = 0; x < group.invited.length; x++) {
            User.findByIdAndUpdate(group.invited[x], {$addToSet: {groupinvites: group._id}});
        };
    }).catch(() => {
        return res.status(400).send("Failed to invite users to group");
    })
});


app.post('/user/:userID/groups', (req, res) => {
    //Create a new Group 
    var groupinfo = _.pick(req.body, ['group']).group;
    var group = new Group({
        name: groupinfo.name,
        creator: req.params.userID,
        invited = ((invited in groupinfo) ? groupinfo.invited : []),
        members = [req.params.userID],
    });
    
    group.save().then((group) => {
        for (var x = 0; x < group.invited.length; x ++) {
            User.findByIdAndUpdate(group.invited[x], {$push: {groupinvites: group._id}});
        };
        return res.status(200).send(group);
    }).catch(() => {
        return res.status(400).send("Failed to create group");
    });
});

app.delete('/users/:userID/groups/:groupID', (req, res) => {
    Group.findOne({
        _id: req.params.groupID,
        $elemMatch: {members: req.params.userID}
    }).then((group) => {
        if (group.owner.equals(req.params.userID)) {
            return res.status(400).send("Owner of group cannot leave/be removed");
        } else {
            Group.findByIdAndUpdate(group._id, {$pull: {members: req.params.userID}}).then((group) => {
                User.findByIdAndUpdate(req.params.userID, {$pull: {groups: group._id}}).then((user) => {
                    return res.status(200).send("User removed from group");
                });
            }).catch(() => {
                return res.status(400).send("Failed to remove user from group");
            });
        };
    }).catch(() => {
        return res.status(404).send("Group not Found");
    });
});

app.delete('/groups/:groupId', (req, res) => {

});

app.get('/groups/:groupId', (req, res) => {
    Group.findById(req.params.groupID).then((group) => {
        var data = {
            name: group.name,
            creator: {},
            invited: [],
            members: [],
            calendars: []
        };
        var promises = []
        for (var x = 0; x < group.invited; x++) {
            promises.push(User.findById(group.invited[x]).then((invitedUser) => {
                data.invited.push({
                    email: invitedUser.email,
                    _id: invitedUser._id
                });
            }).catch((err) => {
                console.error(err)
            }));
        };
        for (var x = 0; x < group.members; x++) {
            promises.push(User.findById(group.members[x]).then((member) => {
                data.members.push({
                    email: member.email,
                    _id: memeber._id
                });
            }).catch((err) => {
                console.error(err);
            }));
        };
        for (var x = 0; x < group.calendars; x++) {
            promises.push(Calendar.findById(group.calendars[x]).then((calendar) => {
                data.calendars.push({
                    name: calendar.name,
                    description: calendar.description,
                    owner: calendar.owner,
                    events: []
                });
                for (var y = 0; y < calendar.events.length; y++) {
                    Evento.findById(calendar.events[y]).then((event) => {
                        data.calendars.events.push(event);
                    }).catch((err) => {
                        console.error(err);
                    });
                };
            }).catch((err) => {
                console.log(err);
            }));
        };
        q.all(promises).then(() => {
            return res.status(200).send(data);
        })
    }).catch(() => {
        return res.status(404).send("Group not Found");
    })
});