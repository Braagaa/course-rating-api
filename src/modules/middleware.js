const R = require('ramda');

const {Course} = require('../models/');
const {setProp, status, callNoArg} = require('./utils');
const {
    invalidId, 
    throwNewErrorIf, 
    createError
} = require('./error-handling');

const courseParam = function(req, res, next, id) {
    const status404 = R.thunkify(status(404));
    const errorMessage = 'Course could not be found.'
    return Course.findPopulate(id)
        .then(throwNewErrorIf(null, errorMessage, 404))
        .then(setProp('course', R.__, req))
        .then(callNoArg(next))
        .catch(invalidId(errorMessage, 404))
        .catch(next);
};

const checkUsersCourse = function({user, course}, res, next) {
    if (course.user.id != user.id)
        return next(createError("Can only update user's created courses.", 403));
    next();
}

module.exports = {courseParam, checkUsersCourse};
