const express = require('express');
const R = require('ramda');

const {Course} = require('../../models/');
const {authUser} = require('../../modules/auth');
const {set, json, status, end} = require('../../modules/utils');
const {courseParam, checkUsersCourse} = require('../../modules/middleware');
const {
    checkValidationError,
    checkCastError
} = require('../../modules/error-handling');

const router = express.Router();

router.param('courseId', courseParam);

router.get('/', (req, res, next) => {
    return Course.find({}, {title: 1})
        .then(json(R.__, res))
        .catch(next);
});

router.get('/:courseId', ({course}, res, next) => {
    return res.json(course);
});

router.post('/', authUser, (req, res, next) => {
    const {user, body} = req;
    return Course.create({user: user._id, ...body})
        .then(R.always(res))
        .then(status(201))
        .then(R.tap(set('Location', '/')))
        .then(end)
        .catch(checkValidationError)
        .catch(next);
});

router.put('/:courseId', authUser, checkUsersCourse, (req, res, next) => {
    const {course, body} = req;
    return course.update(body, {runValidators: true})
        .then(R.always(res))
        .then(status(204))
        .then(end)
        .catch(checkValidationError)
        .catch(checkCastError)
        .catch(next);
});

router.post('/:courseId/reviews', authUser, (req, res, next) => {
    const {course, user, body} = req;
    return course.addReview(user, body)
        .then(R.always(res))
        .then(status(201))
        .then(R.tap(set('Location', `/api/courses/${course.id}`)))
        .then(end)
        .catch(checkValidationError)
        .catch(next);
});

module.exports = router;
