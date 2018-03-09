var User = require('../models/user').User;
var Calendar = require('../models/calendar').Calendar;
var Group = require('../models/group').Group;
var UEvent = require('../models/event').UEvent;
let express = require('express');
const _ = require('lodash');
const q = require('q');
const verifyToken = require('../token-handler').verifyToken;
let groupRouter = express.Router();

groupRouter.patch('/groups/:groupID/accept', verifyToken, (req, res) => {
    //accept or decline a group invite
    var accept = _.pick(req.body, ['accept']).accept;

    if (accept == true) { //== true is needed because accept will be a string and always evaluate to true but == converts types
		//update group
        Group.findOneAndUpdate(
			{ _id: req.params.groupID },
			{ $addToSet: { members: req.decoded.user._id },
              $pull: { invited: req.decoded.user._id } }
		  ).then(() => {
			//update user
			User.findOneAndUpdate({
	            _id: req.decoded.user._id
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
			{ $pull: { invited: req.decoded.user._id } }
		).then(() => {
			//update user
			User.findOneAndUpdate({
				_id: req.decoded.user._id
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
    Group.findById(req.params.groupID).then((group) => {
        //Remove people in the group from the list of people to invite
        let members = [];
        let invited = [];
        for (let x = 0; x < group.members.length; x++) {
            let index = invites.indexOf(group.members[x].toString());
            if (index > -1) {
                members.push(invites[index]);
                invites.splice(index, 1);
            };
        };
        //Don't re-invite people
        for (let x = 0; x < group.invited.length; x++) {
            let index = invites.indexOf(group.invited[x].toString());
            if (index > -1) {
                invited.push(invites[index]);
                invites.splice(index, 1);
            };
        };
        //Invite the remaining people
        var success = [];
        var failed = [];
        let promises = [];
        for (i = 0; i < invites.length; i++) {
            let temp = invites[i];
            promises.push(User.findByIdAndUpdate(
                temp,
                { $addToSet: { groupinvites: req.params.groupID } })
                .then((user) => {
                    success.push(user._id);
                }).catch((err) => {
                    failed.push(temp);
                }));
        };
        q.allSettled(promises).then(() => {
            Group.findByIdAndUpdate(req.params.groupID, {$addToSet: { invited: {$each: success}}}).then(() => {
                return res.status(200).send({successfully_invited: success, failed_invitations: failed, already_members: members, already_invited: invited});
            }).catch(() => {
                return res.status(400).send("Failed to add invites to group, but invites were sent to users");
            });
        });
    }).catch(() => {
        return res.status(404).send("Group not Found");
    });
});

groupRouter.post('/groups', verifyToken, (req, res) => {
    //Create a new Group
    var groupinfo = _.pick(req.body, ['group']).group;
    if (groupinfo.name == undefined || groupinfo.name == '') {
        return res.status(400).send('Name must be specified and non-empty')
    }
    User.findById(req.decoded.user._id).then((user) => {
        var group = new Group({
            name: groupinfo.name,
            owner: user._id,
            members: [user._id]
        });
        
        group.save().then((group) => {
            User.findOneAndUpdate({_id: user._id}, {$push: {groups: group._id}}).then(() => {
                return res.status(200).send(group);
            }, (err) => console.log(err));
        }).catch(() => {
            return res.status(400).send("Failed to create group");
        });
    }).catch(() => {
        return res.status(404).send("User not found");
    });

});


groupRouter.delete('/users/:userID/groups/:groupID', (req, res) => {
    //remove a user from a group
    Group.findById(req.params.groupID).then((group) => {
        let temp = false;
        for (let x = 0; x < group.members.length; x++) {
            if (group.members[x].toString() == req.params.userID){
                temp = true;
                break;
            };
        };
        if (temp == false)
            return res.status(400).send("User not a member of group");
        if (`${group.owner}` == req.params.userID) {
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
    }).catch((err) => {
        return res.status(404).send("Group not Found");
    });
});

//TODO delete a group
groupRouter.delete('/groups/:groupId', (req, res) => {

});

groupRouter.get('/groups', verifyToken, (req, res) => {
    let userID = req.decoded.user._id;
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

groupRouter.get('/groups/invites', verifyToken, (req, res) => {
    User.findById(req.decoded.user._id).then((user) => {
        return res.status(200).send(user.groupinvites);
    }).catch(() => {
        return res.status(404).send("User not Found");
    });
});
module.exports = groupRouter;
