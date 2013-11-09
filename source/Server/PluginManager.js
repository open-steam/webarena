"use strict";

var PluginManager = {};

/**
 *
 * @param {Object} modulesToLoad - a list of module-names of module locations that should be loaded
 *        {
 *          "pluginName" : "moduleName"
 *          ......OR......
 *          "pluginName" : "moduleLocation"
 *        }
 */
PluginManager.init = function (modulesToLoad) {
	this.loadedPlugins = {};
	for(var moduleName in modulesToLoad){
		try{
			this.loadedPlugins[moduleName] = require(pluginModule);
		} catch(e){
			//TODO - do some error handling....
		}
	}
	return this.loadedPlugins;
};

/**
 * Create a PluginManager instance. Normally there should be only one.
 *
 * @returns {PluginManager|*}
 */
function create() {
	return Object.create(PluginManager);
}

module.exports = {create: create};