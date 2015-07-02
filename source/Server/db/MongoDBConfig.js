/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author University of Paderborn, 2014
 *
 *    @class MongoDBConfig
 *    @classdesc manages the configuration data of mongodb
 */

"use strict";

var localconfig = require('../../config.local.js');

var MongoDBConfig = {};
var uri = "";

/**
 * URI Format: http://docs.mongodb.org/manual/reference/connection-string/
 * example 'mongodb://username:password@host:port/database?options...';
 * @return {undefined}
 */
var createURI = function () {
    var uri = 'mongodb://';

    uri += ((localconfig.server.mongodb.user != '') && (localconfig.server.mongodb.password != '')) ?
    localconfig.server.mongodb.user + ":" + localconfig.server.mongodb.password + "@" : "";

    uri += localconfig.server.mongodb.host;
    uri += (localconfig.server.mongodb.port != '') ? ":" + localconfig.server.mongodb.port : "";
    uri += (localconfig.server.mongodb.dbname != '') ? "/" + localconfig.server.mongodb.dbname : "";

    return uri;
};

MongoDBConfig.getURI = function () {
    return uri;
}

module.exports = function() {
    uri = createURI();

    return MongoDBConfig;
};