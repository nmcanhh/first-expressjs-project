const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/K5-Nodemy', {
  useNewurlParser: true,
  useUnifiedTopology: true
});

const Schema = mongoose.Schema;

const AccountSchema = new Schema ({
    username: String,
    password: String
}, {
    collection: 'account'
});

const AccountModel = mongoose.model('account', AccountSchema);

module.exports = AccountModel;
