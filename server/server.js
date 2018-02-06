//set up env variables
require('./src/config/config');

//require libraries
let express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');

var exports = module.exports = {};

//include objects
const { mongoose, mongoUrl } = require('./src/database/mongoose');
const { ObjectID } = require('mongodb');
const { User } = require('./src/models/user');
const { Evento } = require('./src/models/event');
const { Calendar } = require('./src/models/calendar');
const { Group } = require('./src/models/group');


//set up server
let app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.urlencoded({
	extended:true
}));
app.use(bodyParser.json());

app.use('/', express.static('../uCalAngular/dist'));


//paths
app.get('/*', (req, res) => {
    res.sendFile('index.html', {root: '../uCalAngular/dist'});
})


//listen
app.listen(port, () => console.log(`Listening on port ${port}`));
