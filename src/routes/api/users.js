const express = require('express');
const R = require('ramda');

const {User} = require('../../models/');
const {redirect} = require('../../modules/utils');

const {
    checkValidationError, 
    checkCastError
} = require('../../modules/error-handling');

const router = express.Router();

router.get('/', (req, res, next) => {

});

router.post('/', ({body}, res, next) => {
    return User.create(body)
        .then(R.always(res))
        .then(redirect(201, '/'))
        .catch(checkValidationError)
        .catch(checkCastError)
        .catch(next);
});

module.exports = router;
