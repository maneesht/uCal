const mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
	name: {
    type: String,
    required: true
  },
	//TODO add properties
});

//TODO add functions


var Group = mongoose.model('groups', GroupSchema)

module.exports = { Group };
