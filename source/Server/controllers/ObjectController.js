/**
 * Provides API methods for Object related tasks
 */



"use strict";

var fs = require('fs');
var _ = require('lodash');
var async = require("async");
var Q = require("q");

var ObjectController = {}

var Modules = false;
var ObjectManager = false;

ObjectController.init = function(theModules){
	Modules = theModules;
	ObjectManager = Modules.ObjectManager;
}

ObjectController.createObject = function(data, context, callback){

    var roomID = data.roomID;
    var type = data.type;
    var attributes = data.attributes;
    var content = data.content;

    var afterRightsCheck = function(err, mayInsert){
        if(err){
            callback(err, null);
        } else {
            if(mayInsert){
                Modules.ObjectManager.createObject(roomID, type, attributes, content, context, function(err, obj){
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
	var roomID = data.roomID
	var objectID = data.objectID;

	if (!roomID){
		cb(new Error("Room id is missing."), null);
		return;
	}

	var serverFunction = data.fn.name;
	var serverFunctionParams = data.fn.params;

	var probableTransactionInfo = serverFunctionParams[serverFunctionParams.length - 1];
	if (probableTransactionInfo && probableTransactionInfo.transactionId) {
		serverFunctionParams.pop();
	}

	var responseCallback = function(data){
        cb(null, data);
    }

	var object = ObjectManager.getObject(roomID, objectID, context);

	serverFunctionParams.push(responseCallback);

	var fn = object[serverFunction];
	
	if (!fn){
		if(serverFunction!="setAttribute"){
			Modules.Log.warn("Client called a nonexisting function ("+serverFunction+","+object+"). Request will be aborted.");
		}
		return;
	}

	if (!fn.public) {
		Modules.Log.warn("Tried to access non-public method ("+serverFunction+","+object+"). Request will be aborted.");
		return;
	}

    // TODO: extend this for more rights
    // TODO: has to be changed to correct rights names
    // TODO: should not call the Connector but the ObjectManager or the ObjectController itself
    
    
    var rightDummyFunction=function(roomID,objetID,context,callback){
    	//console.log (serverFunction+' is called without rights check!');
    	//console.trace();
    	callback(false,true);
    }
    
    var rightCheckFunction=rightDummyFunction;
    
    if (fn.neededRights && fn.neededRights.write) rightCheckFunction=function(roomID,objetID,context,callback){Modules.Connector.mayWrite(roomID,objetID,context,callback)};

	rightCheckFunction(roomID, objectID, context, function(error,result){
		
		if (result==false){  //Right check returned false
			cb(new Error("You do not have rights on object: " + objectID), null);
			return false;
		}
		
			if (serverFunction === "setAttribute"){
			var oldValue = object.getAttribute(serverFunctionParams[0]);
			var historyEntry = {
				'action': 'set Attribute',
				'objectID': objectID,
				'roomID': roomID,
				'attribute': serverFunctionParams[0],
				'old': oldValue,
				'new': serverFunctionParams[1]
			}
			
			ObjectManager.history.add(new Date().getTime(), probableTransactionInfo.userId, historyEntry);
			Modules.RoomController.informAllInRoom({"room": roomID, 'message': {'change': 'change'}}, null); 
		
		} else if (serverFunction === "setContent") {
			var historyEntry = {
				'objectID': objectID,
				'roomID': roomID,
				'action': 'set Content'
			}
			
			ObjectManager.history.add(new Date().getTime(), context.user.username, historyEntry);
			Modules.RoomController.informAllInRoom({"room": roomID, 'message': {'change': 'change'}}, null); 
			
		}
		fn.apply(object, serverFunctionParams);
		
	});


};

ObjectController.repositionObjects = function(data, context, cb) {
	    var roomID = data.room;    Modules.ObjectManager.getRoom(roomID, context, roomID, function(room) { //the room object        room.repositionAllObjects();    });}


module.exports = ObjectController;