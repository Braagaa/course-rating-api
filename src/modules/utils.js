const R = require('ramda');

const setProp = R.curryN(3, (prop, value, obj) => {
    obj[prop] = value;
    return obj;
});

const callNoArg = fn => () => fn();

const json = R.invoker(1, 'json');
const status = R.invoker(1, 'status');
const redirect = R.invoker(2, 'redirect');
const statusJson = R.pipe(status, R.flip(json));

module.exports = {
    json, 
    statusJson, 
    status, 
    redirect, 
    setProp, 
    callNoArg
};
