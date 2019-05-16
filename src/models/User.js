const {Schema, model} = require('mongoose');
const {validate: validEmail} = require('isemail');
const {hash} = require('bcrypt');

const UserSchema = new Schema({
    fullName: {
        type: String, 
        required: [true, 'Full name is required.'], 
        trim: true
    },
    emailAddress: {
        type: String, 
        required: [true, 'Email is required.'], 
        trim: true, 
        unique: [true, 'Email is already registered.'],
        validate: {
            validator: validEmail, 
            message: '{VALUE} is not a valid email.'
        }
    },
    password: {type: String, required: [true, 'Password is required.']}
});
UserSchema.pre('save', function() {
    const user = this;
    return hash(user.password, 10)
        .then(hashPass => user.password = hashPass);
});

const User = model('User', UserSchema);

module.exports = User;
