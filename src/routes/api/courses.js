const express = require('express');
const R = require('ramda');

const {Course} = require('../../models/');
const {authUser} = require('../../modules/auth');
const {redirect} = require('../../modules/utils');

const router = express.Router();

router.post('/', authUser, (req, res, next) => {
    const {user, body} = req;
    return Course.create({user: user._id, ...body})
        .then(R.always(res))
        .then(redirect(201, '/'));
});

module.exports = router;
