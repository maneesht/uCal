const mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
	name: {
    type: String,
    required: true
  },
  date: {
    day: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  allDay: Boolean,
  startTime: {
    hour: Number,
    minute: Number
  },
  endTime: {
    hour: Number,
    minute: Number
  },
  location: {
    name: String,
    longitude: Number,
    latitude: Number
  },
  description: String,
  owner: mongoose.Schema.Types.ObjectId,
  calendar: mongoose.Schema.Types.ObjectId,
  invites: [mongoose.Schema.Types.ObjectId],
  rsvp: {
    required: false,
    accepted: [mongoose.Schema.Types.ObjectId],
    declined: [mongoose.Schema.Types.ObjectId],
    noResponse: [mongoose.Schema.Types.ObjectId]
  }
});

//TODO add functions

//can't name it Event cause of JS
var Evento = mongoose.model('events', EventSchema)

module.exports = { Evento };
