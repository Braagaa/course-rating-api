const {Schema, model} = require('mongoose');
const {validate: validEmail} = require('isemail');
const {hash, compare} = require('bcrypt');
const R = require('ramda');

const {throwNewErrorIf} = require('../modules/error-handling');

const comparepass = R.invoker(1, 'comparepass');

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

UserSchema.method('comparepass', function(password) {
    const user = this;
    const findById = R.thunkify(R.curryN(2, R.bind(User.findById, User)));
    return compare(password, user.password)
        .then(throwNewErrorIf(false, 'Failed to authenticate.', 401))
        .then(findById({_id: user._id}, {__v: 0, password: 0}));
});

UserSchema.static('authenticate', (emailAddress, password) => {
    return User.findOne({emailAddress}, {__v: 0})
        .exec()
        .then(throwNewErrorIf(null, 'No user was found.', 404))
        .then(comparepass(password));
});

const User = model('User', UserSchema);

module.exports = User;
