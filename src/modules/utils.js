const R = require('ramda');

const setProp = R.curryN(3, (prop, value, obj) => {
    obj[prop] = value;
    return obj;
});

const callNoArg = fn => () => fn();

const json = R.invoker(1, 'json');
const status = R.invoker(1, 'status');
const set = R.invoker(2, 'set');
const end = R.invoker(0, 'end');
const statusJson = R.pipe(status, R.flip(json));

module.exports = {
    json, 
    statusJson, 
    status, 
    set,
    end,
    setProp, 
    callNoArg
};
