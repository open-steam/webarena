/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author University of Paderborn, 2014
 *
 *    @class MongoDBConfig
 *    @classdesc manages the configuration data of mongodb
 */

"use strict";

var localconfig = undefined;

function MongoDBConfig(config) {
    localconfig = config;
    this.uri = createURI();
}

MongoDBConfig.prototype = {
    getURI: function () {
        return this.uri;
    }
};

/**
 * URI Format: http://docs.mongodb.org/manual/reference/connection-string/
 * example 'mongodb://username:password@host:port/database?options...';
 * @return {undefined}
 */
var createURI = function () {
    var uri = 'mongodb://';

    uri += ((localconfig.user != '') && (localconfig.password != '')) ?
    localconfig.user + ":" + localconfig.password + "@" : "";

    uri += localconfig.host;
    uri += (localconfig.port != '') ? ":" + localconfig.port : "";
    uri += (localconfig.dbname != '') ? "/" + localconfig.dbname : "";

    return uri;
};

exports = module.exports = MongoDBConfig;