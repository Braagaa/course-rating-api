const {mergeJsFiles} = require('../../modules/fs');

const apiRoutes = mergeJsFiles(__dirname);

module.exports = apiRoutes;
