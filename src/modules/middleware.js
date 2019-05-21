const R = require('ramda');

const {Course} = require('../models/');
const {setProp, status, callNoArg} = require('./utils');
const {invalidId} = require('./error-handling');

const courseParam = function(req, res, next, id) {
    const status404 = R.thunkify(status(404));
    return Course.findPopulate(id)
        .then(setProp('course', R.__, req))
        .then(callNoArg(next))
        .catch(invalidId('Course could not be found.', 404))
        .catch(next);
};

module.exports = {courseParam};
