/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */


"use strict";

var fs = require('fs');
var _ = require('lodash');
var tokenChecker = require("./TokenChecker.js");
var async = require("async");
var Q = require("q");

var Modules = false;
var ObjectManager = {};
var runtimeData = {};
var prototypes = {};

ObjectManager.isServer = true;
ObjectManager.history = require("./HistoryTracker.js").HistoryTracker(100);

var enter = String.fromCharCode(10);

ObjectManager.toString = function () {
	return 'ObjectManager (server)';
}

/**
 *  registerType
 *
 *  registers an object type, so objects can be created by this objectManager
 */
ObjectManager.registerType = function (type, constr) {
	prototypes[type] = constr;
}


/**
 *  remove
 *
 *  deletes an object and informs clients about the deletion
 */
ObjectManager.remove = function (obj) {

	//Send remove to connector

	Modules.Connector.remove(obj.inRoom, obj.id, obj.context);

	//Inform clients about remove.
	obj.updateClients('objectDelete');

}

/**
 *  getPrototype / getPrototypeFor
 *
 *  gets the prototype (the class) of an object.
 */
ObjectManager.getPrototype = function (objType) {
	if (prototypes[objType]) return prototypes[objType];
	if (prototypes['GeneralObject']) return prototypes['GeneralObject'];
	return;
}

ObjectManager.getPrototypeFor = ObjectManager.getPrototype;


/**
 *  buildObjectFromObjectData
 *
 *  creates an object from given objectData. This objectData are the
 *  attributes saved on the persistance layer.
 *
 *  Attention. This is called on EVERY call of getObject so object you
 *  get by getObject is a different one on every call. The consequence
 *  of this is, that you cannot add properties to the object! If you
 *  want to save runtime data, use the runtimeData property.
 *
 */
function buildObjectFromObjectData(objectData, roomID, type) {

	if (!objectData) {
		Modules.Log.error('No object data!');
	}

	var type = type || objectData.type;

	//get the object's prototype

	var proto = ObjectManager.getPrototypeFor(type);

	//build a new object

	var obj = Object.create(proto);
	obj.init(objectData.id);

	//set the object's attributes and rights
	obj.setAll(objectData.attributes);
	obj.rights = objectData.rights;
	obj.id = objectData.id;
	obj.attributeManager.set(objectData.id, 'id', objectData.id);
	obj.inRoom = roomID;
	obj.set('type', type);

	if (!runtimeData[obj.id])runtimeData[obj.id] = {}; //create runtime data for this object if there is none

	obj.runtimeData = runtimeData[obj.id];

    if(typeof obj.afterCreation == "function"){
        obj.afterCreation();
    }

	return obj;
}

/**
 *  getObject
 *
 *  gets an Object by a given id and its context (context is user credentials)
 *
 *  Attention. EVERY call of getObject returns a different object on every call.
 *   The consequence of this is, that you cannot add properties to the object!
 *   If you want to save runtime data, use the runtimeData property.
 */
ObjectManager.getObject = function (roomID, objectID, context) {

	if (!context) throw new Error('Missing context in ObjectManager.getObject');

	var objectData = Modules.Connector.getObjectData(roomID, objectID, context);

	if (!objectData) return false;

	var object = buildObjectFromObjectData(objectData, roomID);

	object.context = context;

	return object;

}

/**
 *  getObjects / getInventory
 *
 *  gets an inventory of all objects in a room by roomID and context. Context
 *  is user credentials.
 *
 *  This function can either be called synchronous or asyncronous.
 *
 * @param roomID
 * @param context
 * @param {Function}[callback]
 *
 */
ObjectManager.getObjects = function (roomID, context, callback) {

	if (!context) throw new Error('Missing context in ObjectManager.getObjects');

	var inventory = [];

	//get the object creation information by the connector
	// {id;type;rights;attributes}

	if (callback == undefined) {
		/* sync. */

		var objectsData = Modules.Connector.getInventory(roomID, context);

		for (var i in objectsData) {
			var objectData = objectsData[i];

			var object = buildObjectFromObjectData(objectData, roomID);

			object.context = context;

			inventory.push(object);
		}

		return inventory;

	} else {
		//async.

		Modules.Connector.getInventory(roomID, context, function (objectsData) {

			for (var i in objectsData) {
				var objectData = objectsData[i];

				var object = buildObjectFromObjectData(objectData, roomID);

				object.context = context;

				inventory.push(object);
			}

			callback(inventory);

		});
	}
}

/**
 *
 *
 * @see ObjectManager.getObjects
 */
ObjectManager.getInventory = ObjectManager.getObjects;

/**
 *  createObject
 *
 *  creates a new object
 *
 **/
ObjectManager.createObject = function (roomID, type, attributes, content, context, callback) {


	//TODO send error to client if there is a rights issue here

	var proto = this.getPrototypeFor(type);

	Modules.Connector.createObject(roomID, type, proto.standardData, context, function (id) {
		var object = ObjectManager.getObject(roomID, id, context);

		//set default attributes
		var defaultAttributes = object.standardData;
		for (var key in defaultAttributes) {
			var value = defaultAttributes[key];
			object.setAttribute(key, value);
		}

		object.setAttribute('name', type);

		for (var key in attributes) {
			var value = attributes[key];
			object.setAttribute(key, value);
		}

		if (content) {
			object.setContent(content);
		}

		Modules.EventBus.emit("room::" + roomID + "::action::createObject", {objectID: id});
		callback(false, object);
	});
}

/**
 * Looks which object types are enabled/blacklisted/whitelisted
 *
 * @returns {Array} - filenames of enabled object types
 */
ObjectManager.getEnabledObjectTypes = function () {
	var files = fs.readdirSync(__dirname + '/../objects');

	files.sort(function (a, b) {
		return parseInt(a) - parseInt(b);
	});

	var whiteList = {};
	var blackList = {};
	var hasWhiteList = false;

	for (var i in Modules.config.objectWhitelist) {
		hasWhiteList = true;
		whiteList[Modules.config.objectWhitelist[i]] = true;
	}

	for (var i in Modules.config.objectBlacklist) {
		blackList[Modules.config.objectBlacklist[i]] = true;
	}

	if (hasWhiteList) {
		whiteList.GeneralObject = true;
		whiteList.Room = true;
		whiteList.IconObject = true;
		whiteList.UnknownObject = true;
		whiteList.ImageObject = true;
	}

	var result = [];

	files.forEach(function (filename) {
		var fileinfo = filename.split('.');
		var index = fileinfo[0];
		var objName = fileinfo[1];

		if (!index) return;
		if (!objName) return;

		if (hasWhiteList && !whiteList[objName]) {
			console.log('Type ' + objName + ' not whitelisted.');
			return;
		}

		if (blackList[objName]) {
			console.log('Type ' + objName + ' is blacklisted.');
			return;
		}

		result.push(filename);
	});

	return result;
}

/**
 *  init
 *
 *  initializes the ObjectManager
 **/
ObjectManager.init = function (theModules) {
	var that = this;
	Modules = theModules;

	//go through all objects, build its client code (the code for the client side)
	//register the object types.

    var processFunction = function(filename){
        var fileinfo = filename.split('.');
        var objName = fileinfo[1];
        var filebase = __dirname + '/../objects/' + filename;

        var obj = require(filebase + '/server.js');
        obj.ObjectManager = Modules.ObjectManager;
        obj.register(objName);

        obj.localIconPath = function (selection) {
            selection = (selection) ? '_' + selection : '';
            return filebase + '/icon' + selection + '.png';
        }
    }

	var files = this.getEnabledObjectTypes();
	files.forEach(function (filename) {


        if(Modules.Config.debugMode){
            processFunction(filename);
        } else {
            try {
                processFunction(filename)
            } catch (e) {
                Modules.Log.warn('Could not register ' + objName);
                Modules.Log.warn(e.stack);
            }
        }

	});
}

ObjectManager.undo = function (data, context, callback) {
	var that = this;
	var userID = data.userID;
	var lastChange = that.history.getLastChangeForUser(userID);

	if (lastChange) {
		if (!lastChange.blocked) {
			var changeSet = lastChange.changeSet;
			var undoMessage = ""
			try {
				changeSet.forEach(function (e) {
					var object = ObjectManager.getObject(e.roomID, e.objectID, context);
					if (e.action === 'delete') {
						Modules.Connector.duplicateObject(e.roomID, e.oldRoomID, e.objectID, context, function (err, newId, oldId) {
							var o2 = ObjectManager.getObject(e.oldRoomID, newId, context);
							o2.updateClients("objectUpdate");
							object.remove();
						});
						undoMessage = 'info.undo.delete';

					} else if (e.action === 'setAttribute') {
						object.setAttribute(e.attribute, e.old);
						undoMessage = 'info.undo.attribute';
					} else if (e.action === 'duplicate') {
						object.remove();
						undoMessage = 'info.undo.duplication';
					} else if (e.action === 'setContent') {
						undoMessage = "Undo of the action isn't supported";
					}
				});
				callback(null, undoMessage);
			} catch (e) {
				callback(null, "info.error");
			}

			that.history.removeHistoryEntry(lastChange.transactionId);

		} else {
			callback(null, 'info.undo.blocked');
		}
	} else {
		callback(null, 'info.undo.nothing');

	}
};

/**
 *  getRoom
 *
 *  returns the a room object for a given roomID
 *
 *  TODO: callback should be last parameter
 **/
ObjectManager.getRoom = function (roomID, context, callback, oldRoomId) {

	if (!context) throw new Error('Missing context in ObjectManager.getRoom');

	Modules.Connector.getRoomData(roomID, context, function (data) {
		var obj = buildObjectFromObjectData(data, roomID, 'Room');
		obj.context = context;
		callback(obj);
	}, oldRoomId);

}

ObjectManager.countSubrooms = function (roomID, context) {
	var counter = 1;

	if (roomID === undefined) return counter;

	var inventory = Modules.Connector.getInventory(roomID, context);
	for (var inventoryKey in inventory) {
		var inventoryObject = inventory[inventoryKey];
		if (inventoryObject.type === "Subroom") {
			counter += ObjectManager.countSubrooms(inventoryObject.attributes.destination, context);
		}
	}

	return counter;
}


/**
 *
 * When using "async" sometimes it is helpful to create a
 * callback wrapper that transforms "false" to an error.
 *
 * @param message - the error message
 * @param cb
 * @returns {Function}
 */
var falseToError = function (message, cb) {
	return function (err, res) {
		if (err) cb(err, null);
		else if (!res) cb(new Error(message), null);
		else cb(null, res);
	}
}

/**
 * Check read rights for multiple files.
 *
 * @param fromRoom
 * @param files
 * @param context
 * @param cb
 */
var mayReadMultiple = function (fromRoom, files, context, cb) {
	var checks = [];
	files.forEach(function (file) {
		checks.push(function (cb2) {
			Modules.Connector.mayRead(fromRoom,file, null, falseToError("Can't read file: " + file, cb2))
		});
	});

	async.parallel(checks, function (err, res) {
		if (err) cb(err, null);
		else cb(null, true);
	});
}


/**
 * 1. Get specified objects (or all of room)
 * 2. Get related objects
 * 3. Copy objects to target room /recursive
 *  3.1 after each recursion-step update objects in room
 *  3.2 after finishing recursion update the room structures
 * 4. Change destinations
 * 5. Update object link targets
 */
ObjectManager.duplicateNew = function (data, context, cbo) {
	var cut = data.cut;

	var attributes = data.attributes || {};
	var idTranslationList = {};
	var reverseIdTranslationList = {};
	var roomTranslationList = {};

	var idList = [];

	//go through all rooms with new room id
	//  go through the subrooms and references of the room and update the room ids to the corresponding new ids.
	var updateRoomIds = function (callback) {
		for (var key in roomTranslationList) {
			var inventory = Modules.Connector.getInventory(roomTranslationList[key], context);
			var filteredRooms = inventory.filter(function(e){return ((e.type ==="Subroom" || e.type === "Exit") && roomTranslationList[inventoryObject.attributes.destination] !== undefined)});
			filteredRooms.forEach(function(inventoryObject){
				inventoryObject.attributes.destination = roomTranslationList[inventoryObject.attributes.destination];
				Modules.Connector.saveObjectData(inventoryObject.inRoom, inventoryObject.id, inventoryObject.attributes, undefined, context, false);
			});
		}
		callback();
	}

	//inner function to do the "main work" recursive for all nested rooms
	var myInnerFunction = function (dataInner, cbi) {
		var newObjects = [];
		var fromRoom = dataInner.fromRoom;
		var toRoom = dataInner.toRoom;
		var objectKeys = dataInner.objects;
		if (objectKeys === "ALL") {
			var inventoryObjects = Modules.Connector.getInventory(fromRoom, context);
			objectKeys = [];
			for(var i = 0 ; i < inventoryObjects.length; i++){
				if(inventoryObjects[i].id !== "undefined"){
					objectKeys.push(inventoryObjects[i].id);
				}
			}
		}
		if(objectKeys === undefined) objectKeys = [];

		//find all unique objects - als traverse the linked objects
		var uniqueObjects = {};
		var findUniqueRelatedObjectsIds = function (objectId) {
			var object = ObjectManager.getObject(fromRoom, objectId, context);
			if (!object) return;
			if (! (objectId in uniqueObjects)) {
				uniqueObjects[objectId] = object;
				var linkedObjects = object.getObjectsToDuplicate();
				linkedObjects.forEach(findUniqueRelatedObjectsIds);
			}
		}
		objectKeys.forEach(findUniqueRelatedObjectsIds);

		//is called after call object were copied
		//updated some properties + visual arrangement
		var updateObj = function (callback) {
			newObjects.forEach(function (object) {
				object.updateLinkIds(idTranslationList); //update links
				// update exits and subrooms if the corresponding rooms were copied
				if (object.getType() === "Subroom" || object.getType() === "Exit") {
					if (roomTranslationList[object.getAttribute("destination")] !== undefined) {
						object.setAttribute("destination", roomTranslationList[object.getAttribute("destination")]);
					}
				}

				if (fromRoom === toRoom) {
					object.setAttribute("x", object.getAttribute("x") + 30);
					object.setAttribute("y", object.getAttribute("y") + 30);
				}

				// add group id if source object was grouped
				if (object.getAttribute("group") && object.getAttribute("group") > 0) {
					object.setAttribute("group", object.getAttribute("group") + 1);
				}

				// set attributes sent by frontend (e.g. new position when moving objects in concurrent view)
				if (attributes[reverseIdTranslationList[object.id]] !== undefined) {
					for (var key in attributes[reverseIdTranslationList[object.id]]) {
						object.setAttribute(key, attributes[reverseIdTranslationList[object.id]][key]);
					}
				}

				//object.updateClients();
				idList.push(object.id);
			});
			callback();
		}


		var toWriteCheck = function (cb) {
			Modules.Connector.mayInsert(toRoom, context, falseToError("Can't insert into the target room!", cb));
		}


		var innerReadCheck2 = function (cb) {
			mayReadMultiple(fromRoom, Object.keys(uniqueObjects), context, cb);
		}


		var objectCopyTasks = [];
		var roomCopyTasks = [];

		//check permissions and if successful
		//go on with further work
		async.series([innerReadCheck2, toWriteCheck],  function (err) {
			//TODO send error to cb
			if (err) cbi(err, null);
			else {
				for (var someObject in uniqueObjects) {
					var object = uniqueObjects[someObject];

					//if room we have to copy it recursively
					if (object.getType() === "Subroom") {
						var roomData = {};
						roomData.fromRoom = object.getAttribute("destination");
						roomData.toRoom = toRoom;
						roomData.cut = cut;
						roomData.objects = "ALL";

						roomCopyTasks.push(function (callback) {
							var uuid = require('node-uuid');
							var newRoom = Modules.Connector.getRoomData(uuid.v4(), context, undefined, toRoom);
							roomData.toRoom = newRoom.id;
							roomTranslationList[roomData.fromRoom] = newRoom.id;

							myInnerFunction(roomData, callback);
						});
					}
					//need function scope because "looping problem" //TODO: link to example
					(function(id){
						objectCopyTasks.push(function (callback) {
							Modules.Connector.duplicateObject(fromRoom,toRoom, id, context, function (err, newId, oldId) {
								if (err) console.log("Error: " + err);

								var obj = Modules.ObjectManager.getObject(toRoom, newId, context);

								if (cut) {
									var oldObject = Modules.ObjectManager.getObject(fromRoom, oldId, context);
									oldObject.remove();
								}

								newObjects.push(obj);
								idTranslationList[oldId] = newId;
								//TODO: remove reverseIdTranslationList can be constructed afterwards
								reverseIdTranslationList[newId] = oldId;

								callback();
							});
						});
					})(someObject);
				}

				//execute the copy tasks
				var tasks = roomCopyTasks.concat( objectCopyTasks);
				async.series( tasks , function(err, res){
					updateObj(cbi);
				});
			}
		});
	}

	//Do the recursive copies etc.
	//When finished update the room IDs
	//In the end we can call the outer callback - we finished our task.
	async.series([function(cb){myInnerFunction(data, cb)}, updateRoomIds], function(err){
		if(err) cbo(err, null);
		else cbo(null, idList);
	});

}


//deleteObject
ObjectManager.deleteObject = function (data, context, callback) {
	var that = this;

	var roomID = data.roomID
	var objectID = data.objectID;

	var afterRightsCheck = function (err, hasRights) {
		if (err) callback(err, null);
		else {
			if (hasRights) {
				var object = ObjectManager.getObject(roomID, objectID, context);
				if (!object) {
					callback(new Error('Object not found ' + objectID), null);
					return;
				}

				Modules.EventBus.emit("room::" + roomID + "::" + objectID + "::delete", data);
				var historyEntry = {
					'oldRoomID': roomID,
					'oldObjectId': objectID,
					'roomID': 'trash',
					'action': 'delete'
				}

				Modules.Connector.getTrashRoom(context, function (toRoom) {
					Modules.Connector.duplicateObject(roomID, toRoom.id, objectID, context, function (err, newId, oldId) {
						object.remove();
						historyEntry["objectID"] = newId;

						var transactionId = data.transactionId;

						that.history.add(transactionId, data.userId, historyEntry);
					});

				});

			} else {
				callback(new Error('No rights to delete object: ' + objectID), null);
			}
		}
	}

	Modules.Connector.mayDelete(roomID, objectID, context, afterRightsCheck)
}

module.exports = ObjectManager;
