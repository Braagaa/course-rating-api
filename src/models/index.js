const {mergeJsFiles} = require('../modules/fs');

const models = mergeJsFiles(__dirname);

module.exports = models;
