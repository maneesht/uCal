const { ObjectID } = require('mongodb');

var { User } = require('./../../src/models/user');
var { Calendar } = require('./../../src/models/calendar');
var { Group } = require('./../../src/models/group');
var { UEvent } = require('./../../src/models/event');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const calendarOneId = new ObjectID();
const calendarTwoId = new ObjectID();
const eventOneId = new ObjectID();
const eventTwoId = new ObjectID();
const eventThreeId = new ObjectID();
const groupOneId = new ObjectID();
const groupTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    email: 'eli@example.com',
    password: 'UserPassOne',
    groups: [
        groupOneId
    ],
    groupinvites: [
        groupTwoId
    ]
}, {
    _id: userTwoId,
    email: 'steve@example.com',
    password: 'UserPassTwo',
    groups: [
        groupTwoId
    ]
}];

const calendars = [{
    _id: calendarOneId,
    name: "Test Calendar 1",
    description: "The description!",
    owner: userOneId,
    users: users[0],
    events: [eventOneId]
}, {
    _id: calendarTwoId,
    name: "Test Calendar 2",
    description: "The description 2!",
    owner: userTwoId,
    users: users[1]
}];

const events = [{
    _id: eventOneId,
    name: "Test Event 1",
    date: { day: 3, month: 4, year: 2018 },
    allDay: false,
    startTime: { day: 3, month: 4, year: 2018, hour: 1, minute: 30 },
    endTime: { day: 3, month: 4, year: 2018, hour: 2, minute: 30 },
    location: {
        activated: true,
        name: "HAAS",
        latitude: 39.4278121,
        longitude: -87.9169907
    },
    description: "CS meeting",
    calendar: calendarOneId,
    rsvp: { activated: true }
}, {
    _id: eventTwoId,
    name: "Test Event 2",
    date: { day: 12, month: 5, year: 2018 },
    allDay: false,
    startTime: { day: 12, month: 5, year: 2018, hour: 2, minute: 00 },
    endTime: { day: 12, month: 5, year: 2018, hour: 6, minute: 30 },
    location: {
        activated: true,
        name: "Lawson",
        latitude: 40.4278121,
        longitude: -86.9169907
    },
    description: "CS meeting",
    calendar: calendarOneId,
    rsvp: { activated: false }
}, {
    _id: eventThreeId,
    name: "Test Event 3",
    date: { day: 15, month: 5, year: 2018 },
    allDay: true,
    location: { activated: false },
    description: "Glorious shower",
    calendar: calendarOneId,
    rsvp: { activated: false }
}];

const groups = [{
    _id: groupOneId,
    name: "Test Group 1",
    creator: userOneId,
    members: [userOneId]
}, {
    _id: groupTwoId,
    name: "Test Group 2",
    creator: userTwoId,
    members: [userTwoId]
}];

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);

    }).then(() => done());
};

const populateCalendars = (done) => {
    Calendar.remove({}).then(() => {
        var calendarOne = new Calendar(calendars[0]).save();
        var calendarTwo = new Calendar(calendars[1]).save();

        return Promise.all([calendarOne, calendarTwo]);

    }).then(() => done());
};

const populateEvents = (done) => {
    UEvent.remove({}).then(() => {
        var eventOne = new UEvent(events[0]).save();
        var eventTwo = new UEvent(events[1]).save();
        var eventThree = new UEvent(events[2]).save();

        return Promise.all([eventOne, eventTwo, eventThree]);

    }).then(() => done());
};

const populateGroups = (done) => {
    Group.remove({}).then(() => {
        var groupOne = new Group(groups[0]).save();
        var groupTwo = new Group(groups[1]).save();

        return Promise.all([groupOne, groupTwo]);

    }).then(() => done());
};

module.exports = { users, calendars, events, groups, populateUsers, populateCalendars, populateEvents, populateGroups };
