/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
* 	RoomState allows users to save the current state of the objects as persistent data.
* 	The data is saved in "data/appdata/roomstate" and is a simple JSON file saved as a .txt.
* 	The internal structure:
* 	roomstate.data.txt = the whole data as .txt
*
* 	If parsed you get an object with the fields: 
*
* 	object.states = {roomID: [arrayOfStateNames]}
* 	object.stateName = {ObjectInventory}
*
*/

"use strict";


var RoomState=Object.create(require('./Application.js'));
var _ = require("underscore");
var objectList={};
var Modules = {};

RoomState.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

/** Saves the current roomstate
 *
 * @param  {[data]} needs to contain roomID, context and statename
 * 
 */
RoomState.saveState=function(data){
	var stateName  = data.stateName
	var self = this;
	Modules.ObjectManager.getInventory(data.roomID, data.context, function callback(inventory){
		var inventoryState = [];

		for(var element in inventory){
			var obj = Modules.ObjectManager.getObject(data.roomID, inventory[element].id, data.context);

			inventoryState.push(obj);
		}
		self.saveApplicationData(self.name, stateName, inventoryState);

		self.updateSavedStatesArray(self, data);
		
	});
}

RoomState.updateSavedStatesArray = function(obj, data){
	var stateName = data.stateName;
	var roomID = data.roomID;
	obj.getApplicationData(obj.name, "states", function callback(states){
		if(states){
			states[roomID].push(stateName);
			obj.saveApplicationData(obj.name, "states", states);
			
		}else{
			var states = {};
			states[roomID] = [];
			states[roomID].push(stateName);
			obj.saveApplicationData(obj.name, "states", states);
		}	
	});
}

/*
*	Restores the selected state from a radio-input selection
*
*	@param  {[Data]} Contains the context, roomID and the selection
*/
RoomState.restoreState=function(data){
	var self = this;
	var selection = data.selection;
	var roomID = data.roomID;
	var objectID = data.objectID;
	var context = data.context;

	for(var entry in selection){
		if(selection[entry].selected == true){
			var stateName = selection[entry].value;
			console.log(stateName +' was chosen');

			Modules.ObjectManager.getInventory(data.roomID, data.context, function (inventory){
				var currentInventory = inventory;
				self.getStateInventory(stateName, function (err, callback){
					var stateInventory = callback;

					var stateInventoryMap = {};
				    var currentInventoryMap = {};

				    console.log("CurrentInventory:");
				    console.log(currentInventory);
				    console.log("StateInventory:");
				    console.log(stateInventory);
				    console.log("#################################################");

				    //Create Key-Value-Object from Array. Keys are Object-IDs
				    for(var i = 0; i < stateInventory.length; i++){
				        stateInventoryMap[stateInventory[i].id] = stateInventory[i];
				    }

				    //Create Key-Value-Object from Array. Keys are Object-IDs
				    for(var i = 0; i < currentInventory.length; i++){
				        currentInventoryMap[currentInventory[i].id] = currentInventory[i];
				    }

				    console.log("CurrentInventoryMap:");
				    console.log(currentInventoryMap);
				    console.log("StateInventoryMap:");
				    console.log(stateInventoryMap);
				    //Doesnt work properly, as it does not compare color or coordinates
				    if(_.isEqual(currentInventory, stateInventory)){
				        console.log('Seit der Speicherung von '+ stateName + ' hat sich nichts geändert');
				        return true;
				    }else{
				        for(var id in currentInventoryMap){
				            console.log('Object');
				            console.log(currentInventoryMap[id]);
				            //does the object also exist in the state?
				            if(stateInventoryMap[id]){
				                //is the object the same as the existing object?
				                if(!(_.isEqual(currentInventoryMap[id], stateInventoryMap[id]))){
				                }else{
				                    //get current object
				                    var currentObject = Modules.ObjectManager.getObject(roomID, id, context);
				                    //get states object
				                    var oldObject = this.getObjectDataByState(roomID, id, stateName);

				                    //restore objects attributes
				                    for(var attr in oldObject.attributes){
				                        currentObject.setAttribute(attr, oldObject.attributes[attr]);
				                    }
				                }
				            }else{
				                var data = {};
				                data.roomID = roomID;
				                data.objectID = id;

				                Modules.ObjectManager.deleteObject(data, context);
				            }
				        }

				        for(var id in stateInventoryMap){
				            //if an object from the state does not exist in the currentInventorymap, create it
				            if(!(currentInventoryMap[id])){
				                console.log(currentInventoryMap[id].type);
				                console.log(currentInventoryMap[id].attributes);

				                Modules.ObjectManager.createObject(roomID, stateInventoryMap[id].type, stateInventoryMap[id].attributes, null, context);
				            }
				        }
				    }
				});
			});
		}
	}
}

/*
*	Returns an array of currently saved states for the current room
*
*
*/
RoomState.getSavedStates = function(object, data, callback){
	this.getApplicationData(this.name, "states", function(err, states){
		var statesForCurrentRoom = states[data.roomID];
		callback(err, statesForCurrentRoom);
	});
}

RoomState.getStateInventory = function(stateName, callback){
	this.getApplicationData(this.name, stateName, callback);
}

module.exports=RoomState;