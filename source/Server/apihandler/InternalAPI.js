'use strict';

var InternalAPI = {};
var Modules = false;
var _ = require('lodash');


InternalAPI.init = function(theModules){
	Modules = theModules;

	Modules.EventBus.on("copyRoom", function(data){
		data.objects = "ALL";

		//TODO real context...
		var context = {
			user : {
				username : "server",
				password : "server"
			}

		};

		Modules.RoomController.duplicateRoom(data, context, data.callback);
	});
}




module.exports = InternalAPI