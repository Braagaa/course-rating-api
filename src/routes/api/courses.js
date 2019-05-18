const express = require('express');
const R = require('ramda');

const {Course} = require('../../models/');
const {authUser} = require('../../modules/auth');
const {redirect} = require('../../modules/utils');
const {checkValidationError} = require('../../modules/error-handling');

const router = express.Router();

router.get('/', (req, res, next) => {
    return Course.find({}, {title: 1})
});

router.post('/', authUser, (req, res, next) => {
    const {user, body} = req;
    return Course.create({user: user._id, ...body})
        .then(R.always(res))
        .then(redirect(201, '/'))
        .catch(checkValidationError)
        .catch(next);
});

module.exports = router;
