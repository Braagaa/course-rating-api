const R = require('ramda');

const {Course} = require('../models/');
const {setProp, status, callNoArg} = require('./utils');
const {invalidId, throwNewErrorIf} = require('./error-handling');

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

module.exports = {courseParam};
