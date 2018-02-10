//set up env variables
require('./src/config/config');

//require libraries
let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
const _ = require('lodash');

//include objects
const { mongoose, mongoUrl } = require('./src/database/mongoose');
const { ObjectID } = require('mongodb');
const { User } = require('./src/models/user');
const { Evento } = require('./src/models/event');
const { Calendar } = require('./src/models/calendar');
const { Group } = require('./src/models/group');



//set up server
let app = express();
let userRouter = require('./src/endpoints/users');
let eventRouter = require('./src/endpoints/event');
let friendsRouter = require('./src/endpoints/friends');
let calendarRouter = require('./src/endpoints/calendars');
let groupRouter = require('./src/endpoints/groups');
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({
	extended:true
}));
app.use(bodyParser.json());

app.use('/', express.static('../uCalAngular/dist'));
app.use('/', userRouter);
app.use('/', friendsRouter);
app.use('/', groupRouter);
app.use('/', eventRouter);
app.use('/', calendarRouter);

//include endpoint functions

//paths
app.get('/*', (req, res) => {
    res.sendFile('index.html', {root: '../uCalAngular/dist'});
})



//route for logging in
app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password)
		.then((user) => {
			res.status(200).send(user);
		}).catch((err) => {
			res.status(400).send(err);
		});
});

//route for finding a user by it's email
app.post('/users/find', (req, res) => {
	var body = _.pick(req.body, ['email']);

	User.findByEmail(body.email)
		.then((user) => {
			res.status(200).send(user);
		}).catch((err) => {
			res.status(400).send(err);
		});
});






//listen
app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;