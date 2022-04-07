const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/K5-Nodemy', {
  useNewurlParser: true,
  useUnifiedTopology: true
});

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  password: String,
  role: String,
}, {
  collection: 'users'
});

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
