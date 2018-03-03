var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var UEvent = require('../models/event').UEvent;
let express = require('express');
const _ = require('lodash');
const q = require('q');
const verifyToken = require('../token-handler').verifyToken;
let groupRouter = express.Router();

groupRouter.patch('/user/:userId/groups/:groupID/accept', (req, res) => {
    //accept or decline a group invite
    var accept = _.pick(req.body, ['accept']).accept;

    if (accept == true) { //== true is needed because accept will be a string and always evaluate to true but == converts types
		//update group
        Group.findOneAndUpdate(
			{ _id: req.params.groupID },
			{ $addToSet: { members: req.params.userId },
              $pull: { invited: req.params.userId } }
		  ).then(() => {
			//update user
			User.findOneAndUpdate({
	            _id: req.params.userId
	        }, {
				$addToSet: { groups: req.params.groupID },
	            $pull: { groupinvites: req.params.groupID }
	        }).then(() => {
				return res.status(200).send("User added to group");
			}).catch((err) => {
	            return res.status(400).send("Failed to update the user");
	        });
        }).catch((err) => {
            return res.status(400).send("Failed to update the group");
        });
    }
	else if (accept == false) {
        Group.findOneAndUpdate(
			{ _id: req.params.groupID },
			{ $pull: { invited: req.params.userId } }
		).then(() => {
			//update user
			User.findOneAndUpdate({
				_id: req.params.userId
			}, {
				$pull: { groupinvites: req.params.groupID }
			}).then(() => {
				return res.status(200).send("User succesfully declined invitation to group");
			}).catch((err) => {
				return res.status(400).send("Failed to update the user");
			});
        }).catch(() => {
            return res.status(400).send("Failed to update the group");
        });
    }
	else {
		res.status(400).send("please send true or false for accept value");
	}
});

groupRouter.patch('/groups/:groupID/invite', (req, res) => {
    //Invite users to the group
    var invites = _.pick(req.body, ['users']).users;

	//TODO make a check to see if the user already has the group in their groups, not just their invited list

    Group.findByIdAndUpdate(
		req.params.groupID,
		{ $addToSet: { invited: { $each: invites } } },
		{ new: true })
		.then((group) => {
			/* TODO this should be redesigned because you have to go to each user in the db that you are
			*  inviting to the group and update their information which requires seperate requests and
			*  it becomes difficult to send responses because you won't know for sure if everything
			*  successful
			*/
	        for (i = 0; i < invites.length; i++) {
	            User.findByIdAndUpdate(
					invites[i],
					{ $addToSet: { groupinvites: req.params.groupID } })
					.then((user) => {
						console.log(`group added to ${user.email}\'s invites`);
					}).catch((err) => {
						return res.status(400).send(`Failed to add the group to ${invites[i]}\'s groups`  + err)
					});
	        };
			res.status(200).send();
    }).catch((err) => {
		console.log(err);
        return res.status(400).send("Failed to invite users to group");
    })
});


groupRouter.post('/user/:userID/groups', (req, res) => {
    //Create a new Group
    var groupinfo = _.pick(req.body, ['group']).group;
    var group = new Group({
        name: groupinfo.name,
        creator: req.params.userID,
        invited: groupinfo.invited || [],
        members: [req.params.userID]
    });

	//TODO add the group to the creator's groups

    group.save().then((group) => {
        for (var x = 0; x < group.invited.length; x ++) {
            User.findByIdAndUpdate(group.invited[x], {$push: {groupinvites: group._id}});
        };
        return res.status(200).send(group);
    }).catch(() => {
        return res.status(400).send("Failed to create group");
    });
});
groupRouter.post('/user/groups', verifyToken, (req, res) => {
    //Create a new Group
    var userID = req.decoded.userId._id;
    var groupinfo = _.pick(req.body, ['group']).group;
    var group = new Group({
        name: groupinfo.name,
        creator: userID,
        invited: groupinfo.invited || [],
        members: group.members
    });

	//TODO add the group to the creator's groups

    group.save().then((group) => {
        console.log('id', group._id);
        User.findByIdAndUpdate(userID, {$push: {groups: group._id}}).then(data => console.log(data));
        for (var x = 0; x < group.invited.length; x ++) {
            //TODO: check status
            User.findByIdAndUpdate(group.invited[x], {$push: {groupinvites: group._id}});
        };
        return res.status(200).send(group);
    }).catch(() => {
        return res.status(400).send("Failed to create group");
    });
});

groupRouter.delete('/users/:userID/groups/:groupID', (req, res) => {
    Group.findOne({
        _id: req.params.groupID,
        $elemMatch: { members: req.params.userID }
    }).then((group) => {
        if (group.owner.equals(req.params.userID)) {
            return res.status(400).send("Owner of group cannot leave/be removed");
        } else {
            Group.findByIdAndUpdate(group._id, { $pull: { members: req.params.userID } }).then((group) => {
                User.findByIdAndUpdate(req.params.userID, { $pull: { groups: group._id } }).then((user) => {
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
//TODO delete a group
groupRouter.delete('/groups/:groupId', (req, res) => {

});

groupRouter.get('/groups/:groupId', (req, res) => {
    Group.findById(req.params.groupId).then((group) => {
        var data = {
            _id: group._id,
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
                    UEvent.findById(calendar.events[y]).then((event) => {
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
        return res.status(400).send("Group not Found");
    })
});

groupRouter.get('/groups', verifyToken, (req, res) => {
    let userID = req.decoded.userId._id;
    User.findById(userID).then((user) => {
        return res.status(200).send(user.groups);
    }).catch(() => {
        return res.status(404).send("User not Found");
    });
});

groupRouter.get('/group/:groupID', (req, res) => {
    Group.findById(req.params.groupID).then((group) => {
        return res.status(200).send(group);
    }).catch(() => {
        return res.status(404).send("Group not found");
    });
});
module.exports = groupRouter;
