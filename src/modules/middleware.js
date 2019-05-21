const R = require('ramda');

const {Course} = require('../models/');
const {setProp, status, callNoArg} = require('./utils');
const {checkValidationError} = require('./error-handling');

const courseParam = function(req, res, next, id) {
    const status404 = R.thunkify(status(404));
    return Course.findPopulate(id)
        .catch(R.always(null))
        .then(setProp('course', R.__, req))
        .then(R.when(R.propEq('course', null), status404(res)))
        .then(callNoArg(next))
        .catch(next);
};

module.exports = {courseParam};
