
const mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
	name: {
    type: String,
    required: true
  },
  owner: mongoose.Schema.Types.ObjectId,
  invited: [mongoose.Schema.Types.ObjectId],
  members: [mongoose.Schema.Types.ObjectId],
  calendars: [mongoose.Schema.Types.ObjectId]
});

GroupSchema.index({name: 'text'});
//TODO add functions


var Group = mongoose.model('groups', GroupSchema)

module.exports = { Group };
