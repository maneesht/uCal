const mongoose = require('mongoose');

var CalendarSchema = new mongoose.Schema({
	name: {
    type: String,
    required: true
  },
	//TODO add properties
});

//TODO add functions


var Calendar = mongoose.model('calendars', CalendarSchema)

module.exports = { Calendar };
