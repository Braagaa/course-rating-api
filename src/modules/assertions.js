const getPath = (body, path) => path.reduce((obj, prop) => obj[prop], body);

const propEq = (prop, value) => res => {
    const val2 = res.body[prop];
    if (val2 != value) 
        throw new Error(`'${prop}' is not '${value}'. It instead is '${val2}'`);
};

const onlyHasProps = (path, props) => res => {
    const obj = getPath(res.body, path);
    if (Object.keys(obj).length != props.length)
        throw new Error('Number of props do not match number of total props given.');
    props.forEach(prop => {
        if (!(prop in obj))
            throw new Error(`Property '${prop}' not found.`);
    });
};
module.exports = {propEq, onlyHasProps};
