const R = require('ramda');
const {setProp} = require('./utils');

const rethrow = val => {
    throw val;
};

const toError = R.construct(Error);

const createError = R.useWith(
    R.flip(setProp('status')), 
    [toError, R.identity]
);

const validationError = R.pipe(
    R.props(['errors', '_message']),
    R.adjust(1, toError),
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

const tThrowNewError = R.useWith(
    R.pipe(R.flip(setProp('status')), rethrow), 
    [toError, R.identity]
);
const throwNewError = R.thunkify(tThrowNewError);
const throwNewErrorIf = R.curryN(3, function(x, message, statusCode) {
    return R.when(R.equals(x), throwNewError(message, statusCode));
});

module.exports = {
    createError,
    toError,
    checkValidationError, 
    checkCastError, 
    throwNewErrorIf
};
