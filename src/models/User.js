const {Schema, model} = require('mongoose');
const {validate: validEmail} = require('isemail');

const UserSchema = new Schema({
    fullName: {type: String, required: true, trim: true},
    emailAddress: {
        type: String, 
        required: true, 
        trim: true, 
        unique: true,
        validate: {
            validator: validEmail, 
            message: '{VALUE} is not a valid email.'
        }
    },
    password: {type: String, required: true}
});

const User = model('User', UserSchema);

module.exports = User;
