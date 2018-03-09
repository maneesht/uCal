const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const  app = require('./../server');
var { User } = require('./../src/models/user');
var { Calendar } = require('./../src/models/calendar');
var { Group } = require('./../src/models/group');
var { UEvent } = require('./../src/models/event');
const { users, calendars, events, groups, populateUsers, populateCalendars, populateEvents, populateGroups } = require('./seed/seed');
require("supertest").agent(app.listen());

beforeEach(populateUsers);
beforeEach(populateCalendars);
beforeEach(populateEvents);
beforeEach(populateGroups);

describe('GROUP TESTS', () => {

//test accepting and declining a group invite
describe('PATCH /groups/:groupID/accept', () => {

    //normally accept an invite to a group
    it('should accept an invite', (done) => {

        var accept = true;

        request(app)
            .patch(`/groups/${groups[1]._id}/accept`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send({accept})
            .expect(200)
            .expect((res) => {
                expect(res.text).toBe("User added to group");
            })
            .end(done);
    });

    //normally declinde an invite to a group
    it('should decline an invite', (done) => {

        var accept = false;

        request(app)
            .patch(`/groups/${groups[1]._id}/accept`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send({accept})
            .expect(200)
            .expect((res) => {
                expect(res.text).toBe("User succesfully declined invitation to group");
            })
            .end(done);
    });

    //try accepting for a group that doesn't exists
    it('should return 400 because the group doesn\'t exist', (done) => {

        var accept = true;

        request(app)
            .patch(`/groups/5784852/accept`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send({accept})
            .expect(400)
            .end(done);
    });

    //try accepting for a user that doesn't exists
    it('should return 400 because the user doesn\'t exist', (done) => {

        var accept = true;

        request(app)
            .patch(`/groups/${groups[1]._id}/accept`)
            .set('x-access-token', 'Bearer ' + 'bad token')
            .send({accept})
            .expect(403)
            .end(done);
    });

    //try accepting for a group that doesn't exists
    it('should return 400 since the group does not exist', (done) => {
        request(app)
            .patch(`/groups/notagroup/accept`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send({accept: true})
            .expect(400)
            .end(done);
    });

    //try doing something other than accepting/declining
    it('should return 400 because the accept value is not specified', (done) => {
        request(app)
        .patch(`/groups/${groups[1]._id}/accept`)
        .set('x-access-token', 'Bearer ' + users[0].token)
        .send({decline: false})
        .expect(400)
        .expect((res) => {
            expect(res.text).toExist;
            expect(res.text).toEqual('please send true or false for accept value')
        })
        .end(done);
    });

    //try sending something other than true or false
    it('should return 400 because the accept value is an invalid type', (done) => {
        request(app)
        .patch(`/groups/${groups[1]._id}/accept`)
        .set('x-access-token', 'Bearer ' + users[0].token)
        .send({decline: "accept"})
        .expect(400)
        .expect((res) => {
            expect(res.text).toExist;
            expect(res.text).toEqual('please send true or false for accept value')
        })
        .end(done);
    });

});

//test inviting users to a group
describe('PATCH /groups/:groupID/invite', () => {

    //invite a user normally
    it('should invite a user to a group', (done) => {

        var body = {
            users: [ users[1]._id ]
        };

        request(app)
            .patch(`/groups/${groups[0]._id}/invite`)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body).toExist
                expect(res.body).toEqual({'successfully_invited': [`${[users[1]._id]}`], 'failed_invitations': [], 'already_members': [], 'already_invited': []});
            })
            //need to refactor the endpoint before you can test what the result looks like
            // .expect((res) => {
            // 	// console.log(res);
            // 	expect(res.body.invited).toContain(users[1]._id.toHexString());
            // })
            .end(done);
    });

    //TODO invite multiple users to a group

    //invite two users to a group, one who is already in the group and one who isn't
    it('should return 200 and the list of who was invited and who wasn\'t', (done) => {
        request(app)
            .patch(`/groups/${groups[0]._id}/invite`)
            .send({users: [users[0]._id, users[1]._id]})
            .expect(200)
            .expect((res) => {
                expect(res.body).toExist;
                expect(res.body).toEqual({'successfully_invited': [`${users[1]._id}`], 'failed_invitations': [], 'already_members': [`${users[0]._id}`], 'already_invited': []});
            })
            .end(done);
    });

    //TODO invite two users to a group, one has already been invited and one who hasn't

    //invite a user that already is in that group
    it('should return 200 and the list of who was invited and who wasn\'t', (done) => {
        request(app)
            .patch(`/groups/${groups[0]._id}/invite`)
            .send({users: [users[0]._id]})
            .expect(200)
            .expect((res) => {
                expect(res.body).toExist;
                expect(res.body).toEqual({'successfully_invited': [], 'failed_invitations': [], 'already_members': [`${users[0]._id}`], 'already_invited': []});
            })
            .end(done);
    });

    //invite a user that has already been invited
    it('should return 200 and the list of who was invited and who wasn\'t', (done) => {
        request(app)
            .patch(`/groups/${groups[1]._id}/invite`)
            .send({users: [users[0]._id]})
            .expect(200)
            .expect((res) => {
                expect(res.body).toExist;
                expect(res.body).toEqual({'successfully_invited': [], 'failed_invitations': [], 'already_members': [], 'already_invited': [`${users[0]._id}`]});
            })
            .end(done);
    });

    //invite a user that doesn't exist
    it('should return 200 with the invalid user as a failed invite', (done) => {
        request(app)
        .patch(`/groups/${groups[1]._id}/invite`)
        .send({users: ['fakeuserid']})
        .expect(200)
        .expect((res) => {
            expect(res.body).toExist;
            expect(res.body).toEqual({'successfully_invited': [], 'failed_invitations': ['fakeuserid'], 'already_members': [], 'already_invited': []});
        })
        .end(done);
    });

    //invite a user to a group that doesn't exist
    it('should return a 404 because the group does not exist', (done) => {
        request(app)
        .patch(`/groups/notagroupid/invite`)
        .send({users: [users[0]._id]})
        .expect(404)
        .expect((res) => {
            expect(res.text).toExist;
            expect(res.text).toEqual("Group not Found");
        })
        .end(done);
    });


});

//test creating a new group
describe('POST /groups', () => {

    //create a group normally
    it('should successfully create a new group and return 200', (done) => {
        request(app)
            .post(`/groups`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send({'group': {
                'name': 'newGroup'
            }})
            .expect(200)
            .expect((res) => {
                expect(res.body).toExist;
                expect(res.body.name).toEqual('newGroup');
                expect(res.body.owner).toEqual(`${users[0]._id}`);
            })
            .end(done);
    });

    //create a group for a user that doesn't exist
    it('should return 404 and fail to create the group', (done) => { 
        request(app)
            .post(`/groups`)
            .set('x-access-token', 'Bearer ' + "notauserstoken")
            .send({'group': {
                'name': 'New Group'
            }})
            .expect(403)
            .end(done);
    });

    //try to create a group without a group name
    it('should fail to create a new group and return 400', (done) => {
        request(app)
            .post(`/groups`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send({'group': {
                'no_name_here': 'notaname'
            }})
            .expect(400)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual("Name must be specified and non-empty");
            })
            .end(done);
    });

    //try to create a group with a name of an empty string
    it('should fail to create a new group and return 400', (done) => {
        request(app)
            .post(`/groups`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send({'group': {
                'name': ''
            }})
            .expect(400)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual("Name must be specified and non-empty");
            })
            .end(done);
    });

});

//test removing a user from a group
describe('DELETE /users/:userID/groups/:groupID', () => {

    //try to remove a user from a group normally
    it('should return 200 and remove the user from the group', (done) => {
        request(app)
            .patch(`/groups/${groups[1]._id}/accept`)
            .set('x-access-token', 'Bearer ' + users[0].token)
            .send({accept: true})
            .expect(200)
            .expect((res) => {
                expect(res.text).toBe("User added to group");
            })
            .end(() => {
                request(app)
                .delete(`/users/${users[0]._id}/groups/${groups[1]._id}`)
                .expect(200)
                .expect((res) => {
                    expect(res.text).toExist;
                    expect(res.text).toEqual('User removed from group');
                })
                .end(done);
            });
    });

    //try to remove a user from a group that doesn't exist
    it('should return 404 since the group does not exist', (done) => {
        request(app)
            .delete(`/users/${users[0]._id}/groups/fakegroupid`)
            .expect(404)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual('Group not Found');
            })
            .end(done);
        });

    //try to remove a group creator from a group
    it('should return 400 since a group creator cannot leave the group', (done) => {
        request(app)
            .delete(`/users/${users[0]._id}/groups/${groups[0]._id}`)
            .expect(400)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual('Owner of group cannot leave/be removed');
            })
            .end(done);
    });

    //TODO try to remove a user that doesn't exist from a group
    it('should return 400 since the user is not a member of the group', (done) => {
        request(app)
            .delete(`/users/fakeuserid/groups/${groups[1]._id}`)
            .expect(400)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual('User not a member of group');
            })
            .end(done);
    });

    //try to remove a user that is not a member of the group from the group
    it('should return 400 since a the user is not a member of the group', (done) => {
        request(app)
            .delete(`/users/${users[0]._id}/groups/${groups[1]._id}`)
            .expect(400)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual('User not a member of group');
            })
            .end(done);
    });
});

//test getting a group
describe('GET /group/:groupId', () => {

    //try getting a group normally
    it('should return 200 and the group information', (done) => {
        request(app)
            .get(`/group/${groups[0]._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body).toExist;
                expect(res.body.members).toContain(`${users[0]._id}`);
                expect(res.body.owner).toEqual(`${users[0]._id}`);
            })
            .end(done);
    });

    //try getting a group that doesn't exist
    it('should return 200 and the group information', (done) => {
        request(app)
            .get(`/group/fakegroup`)
            .expect(404)
            .expect((res) => {
                expect(res.text).toExist;
                expect(res.text).toEqual('Group not found');
            })
            .end(done);
    });
});
});
