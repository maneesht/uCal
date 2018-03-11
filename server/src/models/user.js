const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  password: {
    type: String
  },
  email: {
	type: String,
    required: true,
    unique: true
  },
  isOAuth: Boolean,
  calendars: [{
    edit: Boolean
  }],
  groups: [mongoose.Schema.Types.ObjectId],
  groupinvites: [mongoose.Schema.Types.ObjectId],
  friends: [mongoose.Schema.Types.ObjectId],
  friendRequests: [mongoose.Schema.Types.ObjectId]
},{
  usePushEach: true
});
UserSchema.index({email: 'text'});

//finds and returns a user object with the passed username and password
UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            if (password === user.password) {
                resolve(user);
            }
            else {
                reject();
            }
        });
    });
};

UserSchema.statics.findByEmail = function (email) {
    var User = this;

    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            resolve(user);
        });
    });
};



var User = mongoose.model('users', UserSchema)

module.exports = { User };
