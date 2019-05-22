const auth = require('basic-auth');
const R = require('ramda');

const {User} = require('../models/');
const {setProp, callNoArg} = require('./utils');
const {createError} = require('./error-handling');

const authUser = function(req, res, next) {
    const user = auth(req);
    
    if (!user) return next(createError('Failed to authenticate.', 401));
    return User.findAuth(user.name, user.pass)
        .then(setProp('user', R.__, req))
        .then(callNoArg(next))
        .catch(next);
};

module.exports = {authUser};
