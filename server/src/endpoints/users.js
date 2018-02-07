var User = require('../models/user').User;
var Calendar = require('../models/calendar');
var Group = require('../models/group');
var Evento = require('../models/event');

const { mongoose, mongoUrl } = require('./src/database/mongoose');
const { ObjectID } = require('mongodb');


//route for creating a new user
app.post('/users/create', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	var user = new User(body);

	user.save()
		.then(() => {
			return res.status(200).send("account created for: " + body.email);
		}).catch((err) => {
			return res.status(400).send(err);
		});
});

//route for validating a user's credentials
app.post('/users/validate', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password)
		.then((user) => {
			return res.status(200).send(user);
		}).catch((err) => {
			return res.status(400).send(err);
		});
});

//route for finding a user by it's email
app.post('/users/find', (req, res) => {
	var body = _.pick(req.body, ['email']);

	User.findByEmail(body.email)
		.then((user) => {
			return res.status(200).send(user);
		}).catch((err) => {
			return res.status(400).send(err);
		});
});

//route for updating a user email
app.post('/users/email/update', (req, res) => {
	var body = _.pick(req.body, ['email', 'password', 'newEmail']);

	User.findByCredentials(body.email, body.password)
		.then((user) => {
			user.email = body.email

			user.save()
				.then(() => {
					return res.status(200).send("updated the email to: " + body.newEmail);
				}).catch((err) => {
					//couldn't update the user
					return res.status(400).send(err);
				});
		}).catch((err) => {
			//couldn't find the user
			return res.status(400).send(err);
		});

});

//route for updating a user password
app.post('/users/password/update', (req, res) => {
	var body = _.pick(req.body, ['email', 'password', 'newPassword']);

	User.findByCredentials(body.email, body.password)
		.then((user) => {
			user.password = body.newPassword

			user.save()
				.then(() => {
					return res.status(200).send("updated the password to: " + body.newPassword);
				}).catch((err) => {
					//couldn't update the user
					return res.status(400).send(err);
				});
		}).catch((err) => {
			//couldn't find the user
			return res.status(400).send(err);
		});

});

//route for getting a user's calendars
app.post('/users/calendars/get', (req, res) => {
	var body = _.pick(req.body, ['email']);

	User.findByEmail(body.email)
		.then((user) => {
			return res.status(200).send(user.calendars);
		}).catch((err) => {
			//user couldn't be found
			return res.status(400).send(err);
		});

});

//route for adding a calendar to a user
app.post('/users/calendars/add', (req, res) => {
	var body = _.pick(req.body, ['email', 'calendar', 'edit']);

	User.findByEmail(body.email)
		.then((user) => {
			let calendar = {
				calendarId: body.calendar,
			    edit: body.edit
			}
			user.calendars.push(calendar)

			user.save()
				.then(() => {
					return res.status(200).send(`successfully added ${body.calendar} to ${body.email}'s calendars'`);
				}).catch((err) => {
					//couldn't update the user
					return res.status(400).send(err);
				});
		}).catch((err) => {
			//couldn't find the user
			return res.status(400).send(err);
		});
});

//route for getting a user's groups
app.post('/users/groups/get', (req, res) => {
	var body = _.pick(req.body, ['email']);

	User.findByEmail(body.email)
		.then((user) => {
			return res.status(200).send(user.groups);
		}).catch((err) => {
			//user couldn't be found
			return res.status(400).send(err);
		});

});

//route for adding a group to a user
app.post('/users/groups/add', (req, res) => {
	var body = _.pick(req.body, ['email', 'group']);

	User.findByEmail(body.email)
		.then((user) => {
			user.groups.push(body.group)

			user.save()
				.then(() => {
					return res.status(200).send(`successfully added ${body.group} to ${body.email}'s groups'`);
				}).catch((err) => {
					//couldn't update the user
					return res.status(400).send(err);
				});
		}).catch((err) => {
			//couldn't find the user
			return res.status(400).send(err);
		});
});

//route for getting a user's friends
app.post('/users/friends/get', (req, res) => {
	var body = _.pick(req.body, ['email']);

	User.findByEmail(body.email)
		.then((user) => {
			return res.status(200).send(user.calendars);
		}).catch((err) => {
			//user couldn't be found
			return res.status(400).send(err);
		});

});

//route for adding a friend to a user
app.post('/users/friends/add', (req, res) => {
	var body = _.pick(req.body, ['email', 'friend']);

	User.findByEmail(body.email)
		.then((user) => {
			user.friends.push(body.friend)

			user.save()
				.then(() => {
					return res.status(200).send(`successfully added ${body.friend} to ${body.email}'s groups'`);
				}).catch((err) => {
					//couldn't update the user
					return res.status(400).send(err);
				});
		}).catch((err) => {
			//couldn't find the user
			return res.status(400).send(err);
		});

});
