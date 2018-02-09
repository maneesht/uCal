const mongoose = require('mongoose');

var CalendarSchema = new mongoose.Schema({
	name: {
    type: String,
    required: true
  },
  description: String,
  events: [mongoose.Schema.Types.ObjectId],
  owner: mongoose.Schema.Types.ObjectId,
  group: {
    _id: mongoose.Schema.Types.ObjectId,
    required: false
  },
  users: [mongoose.Schema.Types.ObjectId]
});

//TODO add functions


var Calendar = mongoose.model('calendars', CalendarSchema)

module.exports = { Calendar };
