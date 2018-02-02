const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    require: true,
  },
	email: {
		type: String,
    required: true,
    unique: true
  },
  calendars: [{
    calendarId: mongoose.Schema.Types.ObjectId,
    edit: Boolean
  }],
  groups: [mongoose.Schema.Types.ObjectId],
  friends: [mongoose.Schema.Types.ObjectId]
});

//TODO add functions for the users, like find by credentials



var User = mongoose.model('users', UserSchema)

module.exports = { User };
