const R = require('ramda');
const {setProp} = require('./utils');

const rethrow = val => {
    throw val;
};

const toError = R.construct(Error);

const validationError = R.pipe(
    R.props(['errors', '_message']),
    R.zipWith(R.call, [R.map(R.prop('message')), toError]),
    R.apply(setProp('errors')),
    setProp('status', 422),
);

const checkValidationError = R.ifElse(
    R.propEq('name', 'ValidationError'),
    R.pipe(validationError, rethrow),
    rethrow
);

const castError = R.pipe(
    R.prop('errmsg'),
    R.cond([
        [R.contains('email'), R.always('Email is already registered.')],
        [R.T, R.always('Cast Error')]
    ]),
    toError,
    setProp('status', 422)
);

const checkCastError = R.ifElse(
    R.propEq('code', 11000),
    R.pipe(castError, rethrow),
    rethrow
);

module.exports = {checkValidationError, checkCastError};
