const mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
	name: {
    type: String,
    required: true
  },
	//TODO add properties
});

//TODO add functions

//can't name it Event cause of JS
var Evento = mongoose.model('events', EventSchema)

module.exports = { Evento };
