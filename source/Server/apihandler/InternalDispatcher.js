/**
 * InternalDispatcher is used to provide an API for
 * Plugins in the same NodeJS process.
 *
 */
'use strict';

var InternalDispatcher = {};
var Modules = false;
var _ = require('lodash');


InternalDispatcher.init = function(theModules){
	Modules = theModules;

	Modules.EventBus.on("copyRoom", function(data){
		data.objects = "ALL";

		Modules.RoomController.duplicateRoom(data, data.context, data.callback);
	});

    Modules.EventBus.on("createObject", function(data){
        Modules.ObjectController.createObject(data, data.context, data.callback);
    });
}


module.exports = InternalDispatcher;