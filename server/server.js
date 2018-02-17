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
            return done("Username/Password is incorrect", null);
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
        process.nextTick(() => {
            //add code to put information in database or update db
            done(null, profile);
        })
    }))
//serializes user
//Adds to session
passport.serializeUser((user, done) => {
    done(null, user.id);
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
        if (err) { return next(err); }
        if (!user) { return res.status(500).send(info); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            let token = jwt.sign({ userId: user }, secretKey, {
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
    let token = jwt.sign(req.user, secretKey, {
        expiresIn: '24h'
    });
    res.redirect(`/login-success?token=${token}`);
});
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});
app.use('/', express.static('../uCalAngular/dist'));
app.use('/', userRouter);
app.use('/', friendsRouter);
app.use('/', groupRouter);
app.use('/', eventRouter);
app.use('/', calendarRouter);

//include endpoint functions

app.use('/', userRouter);
app.use('/', friendsRouter);
app.use('/', groupRouter);
app.use('/', eventRouter);
app.use('/', calendarRouter);
app.get('/*', (req, res) => {
    res.sendFile('index.html', { root: '../uCalAngular/dist' });
});
app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
