"use strict";

var PluginManager = {};

/**
 * @param moduleRegistry - server modules
 * @param {Object} modulesToLoad - a list of module-names of module locations that should be loaded
 *        {
 *          "pluginName" : "moduleName"
 *          ......OR......
 *          "pluginName" : "moduleLocation"
 *        }
 */
PluginManager.init = function (moduleRegistry, modulesToLoad) {
	this.loadedPlugins = {};
	for(var moduleName in modulesToLoad){
		try{
			this.loadedPlugins[moduleName] = require(modulesToLoad[moduleName]).create();

			//TODO - perhaps use wrapper around EventBus if need to filter messages that shouldn't be available to plugins like login credentials
			this.loadedPlugins[moduleName].init(moduleRegistry.EventBus);
		} catch(e){
			console.log("error loading: " + moduleName);
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