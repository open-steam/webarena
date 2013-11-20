/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */


"use strict";

var fs = require('fs');
var _ = require('underscore');
var tokenChecker = require("./TokenChecker.js");

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
*	sendRoom
*
*	sends a rooms content to a client (given by its socket)
*
*/
ObjectManager.sendRoom=function(socket, roomID, index){
	var context=Modules.UserManager.getConnectionBySocket(socket);
	
	Modules.ObjectManager.getRoom(roomID, context, function(room) { //the room object

		room.updateClient(socket);				//and send it to the client
		
		Modules.ObjectManager.getInventory(roomID, context, function(objects) {
			for (var i in objects){
				var object = objects[i];
				object.context.room = object.context.rooms[index];
				object.updateClient(socket, 'objectUpdate');	//the object data
				if (object.hasContent()) {		//and its content if there is some
					object.updateClient(socket, 'contentUpdate', object.hasContent(socket));
				}
			}

		});
		
	});	
 
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

ObjectManager.getInventory = ObjectManager.getObjects;

/**
 *  createObject
 *
 *  creates a new object
 *
 **/
ObjectManager.createObject = function (roomID, type, attributes, content, socket, responseID, callback) {

	var context = Modules.UserManager.getConnectionBySocket(socket);

	//TODO send error to client if there is a rights issue here

	var proto = this.getPrototypeFor(type);

	Modules.Connector.createObject(roomID, type, proto.standardData, function (id) {
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

		if (socket && responseID) {
			Modules.Dispatcher.respond(socket, responseID, object.id);
		}
		
		if (callback){
			callback(false,object);
		}

	}, context);

}

/**
 *  addToClientCode (internal)
 **/
ObjectManager.clientCode = '';
function addToClientCode(filename) {
	var file = false;
	try {
		file = fs.readFileSync(filename, 'UTF8');
		ObjectManager.clientCode += enter + enter + '//' + filename + enter + enter + file;
	} catch (e) {
		ObjectManager.clientCode += enter + enter + '//' + filename + enter + enter + '//' + e;
	}
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

	var files = fs.readdirSync('objects');
	var objectTypes = {};

	files.sort(function (a, b) {
		return parseInt(a) - parseInt(b);
	});

	ObjectManager.clientCode = '//Object Code for WebArena Client ' + enter;

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

	files.forEach(function (filename) {

		try {

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

			var filebase = __dirname + '/../objects/' + filename;

			var obj = require(filebase + '/server.js');

			addToClientCode(filebase + '/common.js');
			addToClientCode(filebase + '/client.js');
			addToClientCode(filebase + '/view.js');
			ObjectManager.clientCode += enter + objName + '.register("' + objName + '");' + enter + enter;
			addToClientCode(filebase + '/languages.js');

			obj.ObjectManager = Modules.ObjectManager;
			obj.register(objName);

			obj.localIconPath = function (selection) {
				selection = (selection) ? '_' + selection : '';
				return filebase + '/icon' + selection + '.png';
			}

		} catch (e) {
			Modules.Log.warn('Could not register ' + objName);
			Modules.Log.warn(e);
		}

	});

	//This is the interface for clients. Registering functions for attribute access and
	//other object updates

	//deleteObject
	Modules.Dispatcher.registerCall('deleteObject', function (socket, data, responseID) {

		var context = Modules.UserManager.getConnectionBySocket(socket);

		var roomID = data.roomID
		var objectID = data.objectID;

		Modules.Connector.mayDelete(roomID, objectID, context, function (mayDelete) {

			if (mayDelete) {

				var object = ObjectManager.getObject(roomID, objectID, context);
				if (!object) {
					Modules.SocketServer.sendToSocket(socket, 'error', 'Object not found ' + objectID);
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
					Modules.Connector.duplicateObject(roomID, objectID, function (newId, oldId) {
						object.remove();
						historyEntry["objectID"] = newId;

						var transactionId = data.transactionId;

						that.history.add(transactionId, data.userId, historyEntry);
					}, context, toRoom.id);

				});

			} else {
				Modules.SocketServer.sendToSocket(socket, 'error', 'No rights to get attribute ' + objectID);
			}
		});
	});

	Modules.Dispatcher.registerCall('undo', function (socket, data) {
		var userID = data.userID;
		var context = Modules.UserManager.getConnectionBySocket(socket);


		var lastChange = that.history.getLastChangeForUser(userID);

		if (lastChange) {
			if (!lastChange.blocked) {
				var changeSet = lastChange.changeSet;
				var undoMessage = ""
				try {
					changeSet.forEach(function (e) {
						var object = ObjectManager.getObject(e.roomID, e.objectID, context);


						if (e.action === 'delete') {
							Modules.Connector.duplicateObject(e.roomID, e.objectID, function (newId) {
								var o2 = ObjectManager.getObject(e.oldRoomID, newId, context);
								o2.updateClients("objectUpdate");
								object.remove();
							}, context, e.oldRoomID);
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
					Modules.SocketServer.sendToSocket(socket, 'infotext', undoMessage);
				} catch (e) {
					Modules.SocketServer.sendToSocket(socket, 'infotext', "info.error");
				}

				that.history.removeHistoryEntry(lastChange.transactionId);

			} else {
				Modules.SocketServer.sendToSocket(socket, 'infotext', 'info.undo.blocked');
			}
		} else {
			Modules.SocketServer.sendToSocket(socket, 'infotext', 'info.undo.nothing');

		}
	});

	//createObject
	Modules.Dispatcher.registerCall('createObject', function (socket, data, responseID) {

		var context = Modules.UserManager.getConnectionBySocket(socket);

		var roomID = data.roomID;
		var type = data.type;
		var attributes = data.attributes;
		var content = data.content;

		//Provide response id to inform the client of the newly created object

		//TODO: check why all clients get notified about object creation (spooky =) )

		Modules.Connector.mayInsert(roomID, context, function (mayInsert) {

			if (mayInsert) {

				Modules.ObjectManager.createObject(roomID, type, attributes, content, socket, responseID);

			} else {
				Modules.SocketServer.sendToSocket(socket, 'error', 'No rights to insert in room ' + roomID);
			}

		});

	});

	// duplicateObjects
	Modules.Dispatcher.registerCall('duplicateObjects', _.bind(that.duplicate, that));

	//TODO: find a better place for this...
	Modules.Dispatcher.registerCall('getPreviewableMimeTypes', function (socket, data, responseID) {

		Modules.Dispatcher.respond(socket, responseID, Modules.Connector.getInlinePreviewMimeTypes());

	});

	Modules.Dispatcher.registerCall('roomlist' , function(socket, data, responseID){
		Modules.Connector.listRooms(function(rooms){
			Modules.Dispatcher.respond(socket, responseID, rooms);
		});
	});

	Modules.Dispatcher.registerCall('serverCall', function (socket, data, responseID) {
		var context = Modules.UserManager.getConnectionBySocket(socket);
		var roomID = data.roomID
		var objectID = data.objectID;

		if (!roomID) throw "Room id is missing."

		var serverFunction = data.fn.name;
		var serverFunctionParams = data.fn.params;

		var probableTransactionInfo = serverFunctionParams[serverFunctionParams.length - 1];
		if (probableTransactionInfo && probableTransactionInfo.transactionId) {
			serverFunctionParams.pop();
		}

		Modules.EventBus.emit("room::" + roomID + "::" + objectID, data);

		var responseCallback = function (res) {
			Modules.Dispatcher.respond(socket, responseID, res);
		};

		var object = ObjectManager.getObject(roomID, objectID, context);

		serverFunctionParams.push(responseCallback);

		var fn = object[serverFunction];

		if (!fn.public) {
			console.log("Tried to access non-public method. Request will be aborted.");
			return false;
		}
		var callbackStack = [];

		// Build async. structure. Check rights async and only execute function if all
		// rights are granted.
		// TODO: hard to understand - perhaps switch to promises.
		var getNext = function (lastRes) {
			//Abort because a test failed - no permission
			if (lastRes === false) return false
			var next = callbackStack.shift()
			next();
		}

		//check needed rights
		if (fn.neededRights && fn.neededRights.write) callbackStack.push(function () {
			Modules.Connector.mayWrite(roomID, objectID, context, getNext)
		})
		if (fn.neededRights && fn.neededRights.read) callbackStack.push(function () {
			Modules.Connector.mayRead(roomID, objectID, context, getNext)
		})
		if (fn.neededRights && fn.neededRights.delete) callbackStack.push(function () {
			Modules.Connector.mayDelete(roomID, objectID, context, getNext)
		})


		callbackStack.push(function () {
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

				that.history.add(probableTransactionInfo.transactionId, probableTransactionInfo.userId, historyEntry);
			} else if (serverFunction === "setContent") {
				var historyEntry = {
					'objectID': roomID,
					'roomID': roomID,
					'action': 'setContent'
				}
				Modules.ObjectManager.history.add(
						new Date().toDateString(), context.user.username, historyEntry
				)
			}

			getNext();
		});

		callbackStack.push(function () {
			fn.apply(object, serverFunctionParams);

		});


		//Call first method from callbackstack
		callbackStack.shift().call()
	});


	Modules.Dispatcher.registerCall('memoryUsage', function (socket, data, responseID) {

		var util = require('util');

		var result = {};

		result.memory = util.inspect(process.memoryUsage());

		console.log(result);

		Modules.Dispatcher.respond(socket, responseID, result);

	});

	//Information are sent to all clients in the same room
	Modules.Dispatcher.registerCall('inform', function (socket, data, responseID) {

		var connections = Modules.UserManager.getConnectionsForRoom(data.room);

		for (var i in connections) {
			var socket = connections[i].socket;
			Modules.SocketServer.sendToSocket(socket, 'inform', data);
		}

		/*
		 if (data.message.text !== undefined) {
		 // chat message

		 var context=Modules.UserManager.getConnectionBySocket(socket);
		 ObjectManager.getRoom(data.room,context,function(room) {

		 var oldMessages = room.get('chatMessages');
		 if (oldMessages === undefined) oldMessages = [];
		 oldMessages.push(data);

		 oldMessages = oldMessages.slice(-20); //only save the last 20 messages
		 room.set('chatMessages', oldMessages); room.persist();

		 });
		 }
		 */

	});

	Modules.Dispatcher.registerCall('bugreport', function (socket, data, responseID) {

		if (Modules.config.bugreport === undefined) {
			console.log("Bug report settings missing!");
			return;
		}

		var email = require("emailjs/email");
		var server = email.server.connect({
			user: Modules.config.bugreport.server.user,
			password: Modules.config.bugreport.server.password,
			host: Modules.config.bugreport.server.host,
			ssl: Modules.config.bugreport.server.ssl,
			port: Modules.config.bugreport.server.port,
		});

		var date = new Date();

		var text = "Datum: " + date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear() + ", " + date.getHours() + ":" + date.getMinutes() + " Uhr" + "\n";
		text += "UserAgent: " + data.userAgent + "\n";
		text += "Benutzer: " + data.user + "\n";
		text += "eMail: " + data.email + "\n\n";

		text += "Was wollten Sie tun?\n----------------------------------\n";
		text += data.task + "\n\n\n";

		text += "Welches Problem ist aufgetreten?\n----------------------------------\n";
		text += data.problem + "\n\n\n";

		text += "Objekte im Raum:\n----------------------------------\n";
		text += data.objects;

		if (Modules.config.bugreport.recipients !== undefined) {

			var counter = 0;

			for (var i in Modules.config.bugreport.recipients) {
				var emailAddress = Modules.config.bugreport.recipients[i];

				server.send({
					text: text,
					from: Modules.config.bugreport.server.from,
					to: emailAddress,
					subject: Modules.config.bugreport.server.subject
				}, function (err, message) {

					if (counter == 0) {

						if (err === null) {
							Modules.Dispatcher.respond(socket, responseID, true); //ok
						} else {
							Modules.Dispatcher.respond(socket, responseID, false); //error sending mail
						}

					}

					counter++;

				});

			}

		} else {
			console.log("no recipients for bug report");
		}

	});

}

/**
 *  getRoom
 *
 *  returns the a room object for a given roomID
 **/
ObjectManager.getRoom = function (roomID, context, callback, oldRoomId) {

	if (!context) throw new Error('Missing context in ObjectManager.getRoom');

	Modules.Connector.getRoomData(roomID, context, function (data) {
		var obj = buildObjectFromObjectData(data, roomID, 'Room');
		obj.context = context;
		callback(obj);
	}, oldRoomId);

}

/**
 *  getClientCode
 *
 *  get the combined client side sourcecode for objects.
 **/
ObjectManager.getClientCode = function () {

	//turn on strict mode for client side scripting
	var code = '"use strict";';

	var lines = this.clientCode.split(enter);

	var showDebugLineNumbers = !!Modules.config.showDebugLineNumbers;
	//fill in line numbers for debugging
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		code += line

		if (showDebugLineNumbers) code += ' //' + (i + 1)

		code += enter
	}

	return code;
}

/*
 ObjectManager.sendChatMessages=function(roomID,socket) {

 var context=Modules.UserManager.getConnectionBySocket(socket);
 ObjectManager.getRoom(roomID,context,function(room) {

 var oldMessages = room.get('chatMessages');
 if (oldMessages === undefined) oldMessages = [];

 for (var i in oldMessages) {
 var data=oldMessages[i];
 data.message.read=true;
 Modules.SocketServer.sendToSocket(socket,'inform',data);
 }

 });

 }
 */

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

ObjectManager.duplicate = function (socket, data, responseID, callback) {
	var that = this;

	var context = Modules.UserManager.getConnectionBySocket(socket);

	var cut = data.cut;
	var fromRoom = data.fromRoom;
	var toRoom = data.toRoom;
	var objects = data.objects;
	var attributes = data.attributes;

	var transactionId = new Date().getTime();

	// collect unique objects to duplicate (each linked object only once); count number of subrooms contained (recursively) in the marked objects
	var objectList = {};
	var objectCount = 0;
	var roomCount = 1;
	for (var key in objects) {
		var object = ObjectManager.getObject(fromRoom, objects[key], context);
		if (!object) {
			continue;
		}
		if (!(objects[key] in objectList)) {
			objectList[objects[key]] = object;
			objectCount++;

			if (object.getType() === "Subroom") {
				roomCount += ObjectManager.countSubrooms(object.getAttribute("destination"), context);
			}

			var linkedObjects = object.getObjectsToDuplicate();
			for (var linkedKey in linkedObjects) {
				if (!(linkedObjects[linkedKey] in objectList)) {
					var newObject = ObjectManager.getObject(fromRoom, linkedObjects[linkedKey], context);
					objectList[linkedObjects[linkedKey]] = newObject;
					objectCount++;

					if (newObject.getType() === "Subroom") {
						roomCount += ObjectManager.countSubrooms(newObject.getAttribute("destination"), context);
					}
				}
			}
		}
	}

	var counter = 0;
	var roomCounter = 0;
	var idTranslationList = {}; //list of object ids and their duplicated new ids
	var reverseIdTranslationList = {};
	var newObjects = []; //list of new (duplicated) objects
	var idList = [];
	var roomTranslationList = {}; // list of old room ids and their duplicated new ids

	// this function will be called after all rooms were copied and updateObjects runs the last time; it updates subroom and exit links to their new copied ids
	var updateRoomLinks = function () {
		roomCounter++;

		if (roomCounter == roomCount) {
			// all rooms copied (and all objects contained in them)
			for (var key in roomTranslationList) {
				var inventory = Modules.Connector.getInventory(roomTranslationList[key], context);

				for (var inventoryKey in inventory) {
					var inventoryObject = inventory[inventoryKey];
					if (inventoryObject.type === "Subroom" || inventoryObject.type === "Exit") {
						if (roomTranslationList[inventoryObject.attributes.destination] !== undefined) {
							inventoryObject.attributes.destination = roomTranslationList[inventoryObject.attributes.destination];
							Modules.Connector.saveObjectData(inventoryObject.inRoom, inventoryObject.id, inventoryObject.attributes, undefined, context, false);
						}
					}
				}
			}
		}
	}

	// this function will be called by the last duplicate-callback
	var updateObjects = function () {
		counter++;
		if (counter == objectCount) {
			// all objects are duplicated
			for (var i in newObjects) {
				var object = newObjects[i];

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
				if (attributes[reverseIdTranslationList[object.id]] != undefined) {
					for (var key in attributes[reverseIdTranslationList[object.id]]) {
						object.setAttribute(key, attributes[reverseIdTranslationList[object.id]][key]);
					}
				}

				object.updateClients();

				if (object.hasContent()) {
					object.updateClient(socket, 'contentUpdate', object.hasContent(socket));
				}

				idList.push(object.id);

			}

			updateRoomLinks();

			if (socket && responseID) {
				Modules.Dispatcher.respond(socket, responseID, idList);
			} else if(callback){
				callback(idList);
			}
		}
	}

	for (var key in objectList) {
		var object = objectList[key];

		Modules.Connector.mayRead(fromRoom, object.id, context, function (mayRead) {

			if (mayRead) {

				Modules.Connector.mayInsert(toRoom, context, function (mayInsert) {

					if (mayInsert) {

						if (object.getType() === "Subroom") {
							var roomData = {};
							roomData.fromRoom = object.getAttribute("destination");
							roomData.toRoom = toRoom;

							_.extend(roomTranslationList, ObjectManager.duplicateRoom(socket, roomData, responseID, updateRoomLinks, transactionId));
						}

						Modules.Connector.duplicateObject(fromRoom, object.id, function (newId, oldId) {
							var obj = Modules.ObjectManager.getObject(toRoom, newId, context);

							// remove old object if the action was cut
							if (cut) {
								var oldObject = Modules.ObjectManager.getObject(fromRoom, oldId, context);
								oldObject.remove();
							}

							newObjects.push(obj);
							idTranslationList[oldId] = newId;
							reverseIdTranslationList[newId] = oldId;

							var historyEntry = {
								"action": "duplicate",
								"objectID": newId,
								"roomID": toRoom
							}
							that.history.add(transactionId, context.user.username, historyEntry);
							Modules.EventBus.emit("room::" + toRoom + "::action::createObject", {objectID: newId});

							updateObjects(); //try to update objects

						}, context, toRoom);

					} else {
						Modules.SocketServer.sendToSocket(socket, 'error', 'No rights to insert in room ' + toRoom);
					}

				});

			} else {
				Modules.SocketServer.sendToSocket(socket, 'error', 'No rights to read ' + object.id);
			}

		});
	}
}

ObjectManager.duplicateRoom = function (socket, data, responseID, updateRoomLinks, transactionId) {
	var that = this;

	var context = Modules.UserManager.getConnectionBySocket(socket);

	var cut = data.cut;
	var fromRoom = data.fromRoom; // room id of the room that is to be duplicated
	var toRoom = data.toRoom; // room id of the parent room where the duplicated room is inserted

	var roomTranslationList = {}; // list of old room ids and their duplicated new ids

	if (fromRoom !== undefined) {
		var objects = Modules.Connector.getInventory(fromRoom, context);
	} else {
		// room corresponding to the link not initialized yet
		var objects = [];
	}

	// create a new subroom in toRoom
	var uuid = require('node-uuid');
	var newRoom = Modules.Connector.getRoomData(uuid.v4(), context, undefined, toRoom);
	toRoom = newRoom.id;
	roomTranslationList[fromRoom] = newRoom.id;

	// var transactionId = new Date().getTime(); ?

	// collect unique objects to duplicate (each linked object only once)
	var objectList = {};
	var objectCount = 0;
	for (var key in objects) {
		var object = ObjectManager.getObject(fromRoom, objects[key].id, context);
		if (!object) {
			continue;
		}
		if (!(objects[key].id in objectList)) {
			objectList[objects[key].id] = object;
			objectCount++;
			var linkedObjects = object.getObjectsToDuplicate();
			for (var linkedKey in linkedObjects) {
				if (!(linkedObjects[linkedKey] in objectList)) {
					objectList[linkedObjects[linkedKey]] = ObjectManager.getObject(fromRoom, linkedObjects[linkedKey], context);
					objectCount++;
				}
			}
		}
	}

	var counter = 0;
	var idTranslationList = {}; //list of object ids and their duplicated new ids
	var newObjects = []; //list of new (duplicated) objects
	var idList = [];

	// this function will be called by the last duplicate-callback
	var updateObjects = function () {
		counter++;
		if (counter == objectCount) {
			// all objects are duplicated
			for (var i in newObjects) {
				var object = newObjects[i];

				object.updateLinkIds(idTranslationList); //update links

				if (fromRoom === toRoom) {
					object.setAttribute("x", object.getAttribute("x") + 30);
					object.setAttribute("y", object.getAttribute("y") + 30);
				}

				// add group id if source object was grouped
				if (object.getAttribute("group") && object.getAttribute("group") > 0) {
					object.setAttribute("group", object.getAttribute("group") + 1);
				}

				object.updateClients();

				if (object.hasContent()) {
					object.updateClient(socket, 'contentUpdate', object.hasContent(socket));
				}

				idList.push(object.id);
			}

			updateRoomLinks();
		}
	}

	for (var key in objectList) {
		var object = objectList[key];

		if (object.getType() === "Subroom") {
			var roomData = {};
			roomData.fromRoom = object.getAttribute("destination");
			roomData.toRoom = toRoom;

			_.extend(roomTranslationList, ObjectManager.duplicateRoom(socket, roomData, responseID, updateRoomLinks, transactionId));
		}

		Modules.Connector.mayRead(fromRoom, object.id, context, function (mayRead) {

			if (mayRead) {

				Modules.Connector.mayInsert(toRoom, context, function (mayInsert) {

					if (mayInsert) {

						Modules.Connector.duplicateObject(fromRoom, object.id, function (newId, oldId) {
							var obj = Modules.ObjectManager.getObject(toRoom, newId, context);

							// remove old object if the action was cut
							if (cut) {
								var oldObject = Modules.ObjectManager.getObject(fromRoom, oldId, context);
								oldObject.remove();
							}

							newObjects.push(obj);
							idTranslationList[oldId] = newId;


							var historyEntry = {
								"action": "duplicate",
								"objectID": newId,
								"roomID": toRoom
							}
							that.history.add(transactionId, context.user.username, historyEntry);
							Modules.EventBus.emit(["room", toRoom, "action" ,  "createObject"], {objectID: newId});


							updateObjects(); //try to update objects

						}, context, toRoom);

					} else {
						Modules.SocketServer.sendToSocket(socket, 'error', 'No rights to insert in room ' + toRoom);
					}

				});

			} else {
				Modules.SocketServer.sendToSocket(socket, 'error', 'No rights to read ' + object.id);
			}

		});
	}

	if (Object.keys(objectList).length === 0) {
		updateRoomLinks();
	}

	// return list of old room ids => new room ids
	return roomTranslationList;
}

module.exports = ObjectManager;
