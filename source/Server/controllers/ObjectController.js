/**
 * Provides API methods for Object related tasks
 */

"use strict";

var async = require("async");
var _	  = require("underscore");

var ObjectController = {}

var Modules = false;
var ObjectManager = false;
var AclManager    = false;

ObjectController.init = function(theModules) {
	Modules = theModules;
	ObjectManager = Modules.ObjectManager;
	AclManager    = Modules.ACLManager;
};

ObjectController.deleteFromClient = function(roomID, objectID, context, socket) {
    var obj = ObjectManager.getObject(roomID, objectID, context);
	obj.updateClient(socket, 'objectDelete');
};

ObjectController.pokeObject = function(roomID, objectID, context) {
	var object = ObjectManager.getObject(roomID, objectID, context);

	if (object) {
		object.persist();
	}
};

ObjectController.createObject = function(data, context, callback) {
	var roomID 		= data.roomID;
	var type 		= data.type;
	var attributes 	= data.attributes;
	var content 	= data.content;

	var user 		= data.passport.user;

	var afterRightsCheck = function(err, mayInsert) {
		if (err) {
			callback(err, null);
		} else {
			if (mayInsert) {
				async.waterfall([
					function(callback) {
						Modules.ObjectManager.createObject(roomID, type, attributes, content, context, function (err, obj) {
							callback(err, obj);
						});
					},
					function(obj, callback) {
						AclManager.userRoles(user, function(err, roles) {
							callback(err, obj, roles);
						});
					},
					function(obj, roles, callback) {
						//var completeRoles = _.union(_.without(roles, 'user'), ['admin']);
						var completeRoles = ['admin'];
						var resource = AclManager.makeACLName(obj.id);

						AclManager.allow(completeRoles, resource, '*', function (err) {
							callback(err, obj);
						});
					}
				], function (err, obj) {
					// we are only interested in the object id.
					callback(err, obj.id);
				});
			} else {
				callback(new Error("No rights to write into room: " + roomID), null);
			}
		}
	}

	Modules.Connector.mayInsert(roomID, context, afterRightsCheck)
}

ObjectController.executeServersideAction = function (data, context, cb) {
	var roomID   = data.roomID
	var objectID = data.objectID;

	if (!roomID) {
		cb(new Error("Room id is missing."), null);
		return;
	}

	var serverFunction 		 = data.fn.name;
	var serverFunctionParams = data.fn.params;

	var probableTransactionInfo = serverFunctionParams[serverFunctionParams.length - 1];
	if (probableTransactionInfo && probableTransactionInfo.transactionId) {
		serverFunctionParams.pop();
	}

	Modules.EventBus.emit("room::" + roomID + "::" + objectID, data);

	var responseCallback = function(data) {
        cb(null, data);
    }

	var object = ObjectManager.getObject(roomID, objectID, context);

	serverFunctionParams.push(responseCallback);

	var fn = object[serverFunction];
	
	if (!fn) {
		if (serverFunction!="setAttribute") {
			Modules.Log.warn("Client called a nonexisting function (" + serverFunction + "," + object + "). Request will be aborted.");
		}

		return;
	}

	if (!fn.public) {
		Modules.Log.warn("Tried to access non-public method ("+serverFunction + "," + object + "). Request will be aborted.");
		return;
	}

	var callbackStack = [];

	//check needed rights
	if (fn.neededRights && fn.neededRights.write) {
        callbackStack.push(function (cb) {
		    Modules.Connector.mayWrite(roomID, objectID, context, cb)
	    });
    }

	if (fn.neededRights && fn.neededRights.read) {
        callbackStack.push(function (cb) {
		    Modules.Connector.mayRead(roomID, objectID, context, cb)
	    });
    }

	if (fn.neededRights && fn.neededRights.delete) {
        callbackStack.push(function (cb) {
            Modules.Connector.mayDelete(roomID, objectID, context, cb)
        });
    }

	async.series(callbackStack, function(err, res) {
		if (err) {
			console.log(err);
			cb(err, null);
			return;
		}

		if (serverFunction === "setAttribute") {
			var oldValue = object.getAttribute(serverFunctionParams[0]);
			var historyEntry = {
				'action': "setAttribute",
				'objectID': objectID,
				'roomID': roomID,
				'attribute': serverFunctionParams[0],
				'old': oldValue,
				'new': serverFunctionParams[1]
			}

			ObjectManager.history.add(probableTransactionInfo.transactionId, probableTransactionInfo.userId, historyEntry);
		} else if (serverFunction === "setContent") {
			var historyEntry = {
				'objectID': roomID,
				'roomID': roomID,
				'action': 'setContent'
			}
			ObjectManager.history.add(
				new Date().toDateString(), context.user.username, historyEntry
			)
		}
		fn.apply(object, serverFunctionParams);
	});
};

module.exports = ObjectController;
