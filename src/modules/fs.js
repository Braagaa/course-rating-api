const {readdirSync} = require('fs');
const path = require('path');
const R = require('ramda');

const join = R.curryN(2, path.join);
const isJSFile = R.pipe(R.takeLast(3), R.equals('.js'));
const isNotIndex = R.pipe(R.dropLast(3), R.complement(R.equals('index')));

const mergeJsFiles = dirname => {
    const getModule = R.pipe(join(`${dirname}/`), require);
    return R.pipe(
        readdirSync,
        R.filter(R.both(isJSFile, isNotIndex)),
        R.map(R.converge(R.objOf, [R.dropLast(3), getModule])),
        R.mergeAll
    )(dirname);
};

module.exports = {mergeJsFiles};
