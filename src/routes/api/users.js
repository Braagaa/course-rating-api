const express = require('express');
const R = require('ramda');

const {User} = require('../../models/');
const {redirect} = require('../../modules/utils');
const {authUser} = require('../../modules/auth');

const {
    checkValidationError, 
    checkCustomErrors
} = require('../../modules/error-handling');

const router = express.Router();

router.get('/', authUser, ({user}, res, next) => {
    return res.json(user);
});

router.post('/', ({body}, res, next) => {
    return User.create(body)
        .then(R.always(res))
        .then(redirect(201, '/'))
        .catch(checkValidationError)
        .catch(checkCustomErrors)
        .catch(next);
});

module.exports = router;
