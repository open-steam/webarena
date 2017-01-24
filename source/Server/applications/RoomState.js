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
	var stateName  = data.stateName;
	var self = this;
	var inventoryState = [];

	Modules.Connector.getInventory(data.roomID, data.context, function callback(inventory){
		for(let element in inventory){
			Modules.Connector.getContent(data.roomID, inventory[element].id, data.context, function(content){
					var obj = Modules.ObjectManager.getObject(data.roomID, inventory[element].id, data.context);
					obj.attributes = {};
					for(var attr in inventory[element].attributes){
						obj.attributes[attr] = inventory[element].attributes[attr];	
					}

					delete obj.context;
					delete obj.runtimeData;

					if(content){
						obj.content = content;
					}

					obj.type = obj.attributes['type'];
					inventoryState.push(obj);
			});	
		}
		self.saveApplicationData(self.name, stateName, inventoryState);
	});
	self.updateSavedStatesArray(data);
}

/**
 * Updates the Array of saved states with the newly-saved states' name
 *
 * @param  {Object} data Contains stateName and roomID
 *
 */
RoomState.updateSavedStatesArray = function(data){
	var self = this;
	var stateName = data.stateName;
	var roomID = data.roomID;
	self.getApplicationData(self.name, "states", function callback(err, states){
		if(states){
			states[roomID].push(stateName);
			self.saveApplicationData(self.name, "states", states);	
		}else{
			var states = {};
			states[roomID] = [];
			states[roomID].push(stateName);
			self.saveApplicationData(self.name, "states", states);
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

			Modules.Connector.getInventory(data.roomID, data.context, function (inventory){
				var currentInventory = inventory;
				self.getStateInventory(stateName, function (err, callback){
					var stateInventory = callback;

					var stateInventoryMap = {};
				    var currentInventoryMap = {};

				    //Create Key-Value-Object from Array. Keys are Object-IDs
				    for(var i = 0; i < stateInventory.length; i++){
				        stateInventoryMap[stateInventory[i].id] = stateInventory[i];
				    }

				    //Create Key-Value-Object from Array. Keys are Object-IDs
				    for(var i = 0; i < currentInventory.length; i++){
				        currentInventoryMap[currentInventory[i].id] = currentInventory[i];
				    }

				    //Doesnt work properly, as it does not compare color or coordinates
				    if(_.isEqual(currentInventoryMap, stateInventoryMap)){
				        return true;
				    }else{
				        for(var id in currentInventoryMap){
				            //does the object also exist in the state?
				            if(stateInventoryMap[id]){
				                //is the object the same as the existing object?
				                if(!(_.isEqual(currentInventoryMap[id], stateInventoryMap[id]))){
				                    //get current object
				                    var currentObject = Modules.ObjectManager.getObject(roomID, id, context);

				                    
				                    //restore objects attributes
				                    for(var attr in stateInventoryMap[id].attributes){
				                        currentObject.setAttribute(attr, stateInventoryMap[id].attributes[attr]);
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
				                var forcedID = stateInventoryMap[id].id;
				                Modules.ObjectManager.createObject(roomID, stateInventoryMap[id].type, stateInventoryMap[id].attributes, null, context);
				            }
				        }
				    }
				});
			});
		}
	}
}

/**
 * Gets all states that are saved for the current room
 *
 * @param  {Object}   object   Object that sends the request
 * @param  {Object}   data     Object containing the roomID at data.roomID
 * @param  {Function} callback Callback function
 *
 */
RoomState.getSavedStates = function(object, data, callback){
	this.getApplicationData(this.name, "states", function(err, states){
		var statesForCurrentRoom = states[data.roomID];
		callback(err, statesForCurrentRoom);
	});
}

/**
 * returns the inventory of a saved state
 *
 * @param  {String}   stateName The states name
 * @param  {Function} callback  the callback function
 *
 * @return {Object}             Inventory-object
 */
RoomState.getStateInventory = function(stateName, callback){
	this.getApplicationData(this.name, stateName, callback);
}

module.exports=RoomState;