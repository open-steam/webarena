/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author University of Paderborn, 2014
*
*	 @class MongoDBConfig
*    @classdesc manages the configuration data of mongodb
*/

"use strict";

var path = require('path');

var MongoDBConfig = {},
    uri = "",
    path2bin = "";

var Modules = false;

/**
 * Init function called in server.js to initialize this module
 * 
 * @param {Object} theModules variable to access the other modules.
 */
MongoDBConfig.init = function(theModules) {
	Modules = theModules;
    uri = createURI();
    
    try {
        path2bin = path.normalize(Modules.config.mongodb.path2bin);
    } catch(err) {
        console.error("MongoDBConfig.init ex: " + err);
    }
}

/**
* @return {undefined}
*/
MongoDBConfig.getURI = function() {
    return uri; 
}

/**
* @return {undefined}
*/
MongoDBConfig.getPath2bin = function() {
    return path2bin; 
}

/**
* URI Format: http://docs.mongodb.org/manual/reference/connection-string/
* example 'mongodb://username:password@host:port/database?options...';
* @return {undefined}
*/
var createURI = function() {
    var uri = 'mongodb://';
    
    uri += ((Modules.config.mongodb.user != '') && (Modules.config.mongodb.password != '')) ? 
             Modules.config.mongodb.user + ":" + Modules.config.mongodb.password + "@" : "";
    
    uri += Modules.config.mongodb.host;
    uri += (Modules.config.mongodb.port != '') ? ":" + Modules.config.mongodb.port : "";
    uri += (Modules.config.mongodb.dbname != '') ? "/" + Modules.config.mongodb.dbname : "";
    
    return uri;
};

module.exports = MongoDBConfig;