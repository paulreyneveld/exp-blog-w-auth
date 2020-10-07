const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    hash: String,
    salt: String,
});

module.exports = mongoose.model('User', UserSchema);