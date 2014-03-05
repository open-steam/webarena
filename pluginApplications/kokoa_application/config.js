var _ = require('lodash');

var defaultConfig = require('./config.default.js');
var localConfig = require('./config.local.js');

module.exports = _.defaults(localConfig, defaultConfig);
