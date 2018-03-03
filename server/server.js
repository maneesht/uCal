//set up env variables
require('./src/config/config');

//include objects
const { mongoose, mongoUrl } = require('./src/database/mongoose');

//set up server
let passport = require('passport');
const port = process.env.PORT || 3000;
let express = require('express');
let cors = require('cors');
const _ = require('lodash');

let GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
let LocalStrategy = require('passport-local');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
var Calendar = require('./src/models/calendar').Calendar;
let session = require('express-session');
let jwt = require('jsonwebtoken');
let secretKey = require('./src/config/config').key;
const app = express();

//routes
app.use(cors());
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ resave: true, saveUninitialized: true, secret: 'asdflasdfasdf' })); //change to environment letiable for dev/prod
app.use(passport.initialize());
app.use(passport.session());

let userRouter = require('./src/endpoints/users');
let eventRouter = require('./src/endpoints/events');
let friendsRouter = require('./src/endpoints/friends');
let calendarRouter = require('./src/endpoints/calendars');
let groupRouter = require('./src/endpoints/groups');

const { User } = require('./src/models/user');

//authentication check for username and password
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    (email, password, done) => {
        // insert validation code here from mongo
        User.findByCredentials(email, password)
        .then((user) => {
            return done(null, user);
        }).catch((err) => {
            return done("Email/Password is incorrect", null);
        });
    }
))
//Google OAuth check
passport.use(new GoogleStrategy({
    clientID: '991204745572-75vgsi67qf7mfpsb89hfk55udr8cjhd3.apps.googleusercontent.com',
    clientSecret: 'qu_PTpwIUGbBGZ7_eOdIAYSA',
    callbackURL: '/auth/google/callback'
},
    (token, refreshToken, profile, done) => {
        let email = profile.emails[0].value;
        process.nextTick(() => {
            //add code to put information in database or update db
            User.findOne({ email }, function (err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                //Regular Expression for finding email addresses
                var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                if (!re.test(email))
                    return done("email not a correct email format");
                if(user) {
                    if(user.isOAuth)
                        return done(null, {email, _id: user._id});
                    else
                        return done("Email already exists");
                }

                var newUser = new User({email, isOAuth: true});
                newUser.save()
                    .then((user) => {
                        //Create a new default calendar for the user as well
                        var calendar = new Calendar({
                            name: "Events",
                            owner: user._id,
                            users: [
                                user._id
                            ]
                        });
                        calendar.save().then((calendar) => {
                            User.findByIdAndUpdate(user._id, { $push: { calendars: { _id: calendar._id, edit: true } } }, { new: true }).then((user) => {
                                done(null, { _id: user._id, email: user.email});
                            }).catch((err) => {
                                done("Failed to save default calendar to user");
                            });
                        }).catch(() => {
                            done("User created but default calendar creation failed.");
                        });
                    }, (data) => done(data));
            });
        });
    }))
//serializes user
//Adds to session
passport.serializeUser((user, done) => {
    done(null, user._id);
});
//deserializes user
//Removes from session
passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user) { //look for id in database
        done(err, user); //deserialize user
    });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return res.status(500).send(err); }
        if (!user) { return res.status(500).send(info); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            let token = jwt.sign({ user }, secretKey, {
                expiresIn: '2 days'
            });
            return res.send({ message: "Success!", token: token });
        });
    })(req, res, next);
});
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/'
}), (req, res) => {
    let token = jwt.sign({ user: req.user}, secretKey, {
        expiresIn: '24h'
    });
    res.redirect(`/login-success?token=${token}`);
});
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
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
app.use('/', express.static('../uCalAngular/dist'));
app.use('/', userRouter);
app.use('/', friendsRouter);
app.use('/', groupRouter);
app.use('/', eventRouter);
app.use('/', calendarRouter);

//include endpoint functions

app.get('/*', (req, res) => {
    res.sendFile('index.html', { root: '../uCalAngular/dist' });
});
if(!module.parent) {
    app.listen(port, () => console.log(`Listening on port ${port}`));
}

module.exports = app;
