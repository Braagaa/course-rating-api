const R = require('ramda');

const {Course} = require('../models/');
const {setProp, callNoArg} = require('./utils');

const courseParam = function(req, res, next, id) {
    return Course.findPopulate(id)
        .then(setProp('course', R.__, req))
        .then(callNoArg(next))
        .catch(next);
};

module.exports = {courseParam};
