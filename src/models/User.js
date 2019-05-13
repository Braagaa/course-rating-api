const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    fullName: {type: String, required: true, trim: true},
    emailAddress: {type: String, required: true, trim: true, unique: true},
    password: {type: String, required: true}
});

const User = model('User', UserSchema);

module.exports = User;
