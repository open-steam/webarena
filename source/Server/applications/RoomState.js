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
var async = require("async");
const util = require('util')

var Modules = {};

var AppDataPath;
var ContentDataPath;
RoomState.GuiData = {hasGui: true};

RoomState.init=function(name, theModules){
	this.name=name;
	Modules=theModules;
	// Necessary to have 2 folders on the same level
	// otherwise the saveApplicationData does not function properly
	AppDataPath = this.name;
	ContentDataPath=this.name+'_content';
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
	var contentState = {};

	if(stateName){
		Modules.Connector.getInventory(data.roomID, data.context, function callback(inventory){
			async.each(inventory, function(object, callback) {
				Modules.Connector.getContent(data.roomID, object.id, data.context, function(content){
						var obj = Modules.ObjectManager.getObject(data.roomID, object.id, data.context);
						obj.attributes = {};

						for(var attr in object.attributes){
							obj.attributes[attr] = object.attributes[attr];	
						}

						delete obj.context;
						delete obj.runtimeData;

						if(obj.hasContent && content){
							contentState[object.id] = content;
						}

						obj.type = obj.attributes['type'];
						inventoryState.push(obj);
						callback();
				});	
			}, function(err) {
				//Called after async.each finishes all iterations
				self.saveContent(contentState, stateName);
				self.saveApplicationData(self.name, stateName, inventoryState);
				self.updateSavedStatesArray(data);

			  	if (err) {
			  		console.error(err.message);
			  	}
			});
		});
	}
}

/**
 * Saves the content of all objects in the current inventory
 *
 * @param  {Object} contentState Contains all content of the inventory
 * @param  {String} stateName    Name of the state for which the content is saved
 *
 */
RoomState.saveContent=function(contentState, stateName){
	var self = this;

	self.getApplicationData(ContentDataPath, stateName, function callback(err, stateObject){
		if(stateObject){
			for(var element in contentState){
				stateObject[element] = contentState[element];
			}
			self.saveApplicationData(ContentDataPath, stateName, stateObject);
		}else{
			var stateObject = contentState;
			self.saveApplicationData(ContentDataPath, stateName, stateObject);
		}	
	});
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
	self.getApplicationData(AppDataPath, "states", function callback(err, states){
		if(states){
			if(states[roomID]){
				console.log(roomID);
				console.log(states);
				states[roomID].push(stateName);
				self.saveApplicationData(AppDataPath, "states", states);	
			}else{
				states[roomID] = [];
				states[roomID].push(stateName);
				self.saveApplicationData(AppDataPath, "states", states);
			}
		}else{
			var states = {};
				states[roomID] = [];
				states[roomID].push(stateName);
				self.saveApplicationData(AppDataPath, "states", states);
		}	
	});
}

/*
*	Restores the selected state from a radio-input selection
*
*	@param  {[Data]} Contains the context, roomID and the selection
*/
RoomState.restoreState=function(data){
	let self = this;
	let selection = data.selection;
	let roomID = data.roomID;
	let objectID = data.objectID;
	let context = data.context;

	for(let entry in selection){
		if(selection[entry].selected == true){
			let stateName = selection[entry].value;

			Modules.Connector.getInventory(data.roomID, data.context, function (inventory){
				let currentInventory = inventory;
				self.getStateInventory(stateName, function (err, callback){
					let stateInventory = callback;

					let stateInventoryMap = {};
				    let currentInventoryMap = {};

				    //Create Key-Value-Object from Array. Keys are Object-IDs
				    for(let i = 0; i < stateInventory.length; i++){
				        stateInventoryMap[stateInventory[i].id] = stateInventory[i];
				    }

				    //Create Key-Value-Object from Array. Keys are Object-IDs
				    for(let i = 0; i < currentInventory.length; i++){
				        currentInventoryMap[currentInventory[i].id] = currentInventory[i];
				    }

				    //Check if there were any changes since the state was saved
				    if(_.isEqual(currentInventoryMap, stateInventoryMap)){
				        return true;
				    }else{
				    	//iterate through the current inventory
				        for(let id in currentInventoryMap){
				            //does the object also exist in the state?
				            if(stateInventoryMap[id]){
				                //is the object the same as the existing object?
				                if(!(_.isEqual(currentInventoryMap[id], stateInventoryMap[id]))){
				                    //get current object
				                    let currentObject = Modules.ObjectManager.getObject(roomID, id, context);
				                    
				                    //restore objects attributes
				                    for(let attr in stateInventoryMap[id].attributes){
				                    	currentObject.setAttribute(attr, stateInventoryMap[id].attributes[attr]);	
				                    }

				                    //restore content of the object if it changed
				                    if(currentObject.hasContent){
				                    		self.getContent(id, stateName, function(objectContent){
				                    			if(!(_.isEqual(currentObject.content, objectContent))){
				                    				console.log("objects are different");
				                    				currentObject.setContent(objectContent);
				                    			}
				                    		});
				                    }
				                }
				            //if it does not exist, delete the object    
				            }else{
				                let data = {};
				                data.roomID = roomID;
				                data.objectID = id;

				                Modules.ObjectManager.deleteObject(data, context);
				            }
				        }

				        //Iterate through the stateInventory and create every object that is currently not existing in the room
				        for(let id in stateInventoryMap){
				            //if an object from the state does not exist in the currentInventorymap, create it
				            if(!(currentInventoryMap[id])){
				            	//if there is content saved, load it from the appdata and create the object
				                if(stateInventoryMap[id].attributes.hasContent){	
				                	self.getContent(stateInventoryMap[id].id, stateName, function(content){
				                		Modules.ObjectManager.createObject(roomID, stateInventoryMap[id].type, stateInventoryMap[id].attributes, content, context);
				                	});
				                //If the object does not have content, just create it
				                }else{
				                	Modules.ObjectManager.createObject(roomID, stateInventoryMap[id].type, stateInventoryMap[id].attributes, null, context);	
				                }
				                
				            }
				        }
				    }
				});
			});
		}
	}
}

/**
 * Gets the content from a given state for a given object and returns it with a callback
 *
 * @param  {String}   objectID  the unqiue objectID
 * @param  {String}   stateName the name of the state
 * @param  {Function} callback  the callback function that returns the content for the object as an array of bytes
 *
 */
RoomState.getContent = function(objectID, stateName, callback){
	this.getApplicationData(ContentDataPath, stateName, function(err, contents){
		callback(contents[objectID]);
	});
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
	this.getApplicationData(AppDataPath, "states", function(err, states){
		if(!err){
			console.log(states);
			var statesForCurrentRoom = states[data.roomID];
			callback(null, statesForCurrentRoom);
		}else{
			callback(err);
		}
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
	this.getApplicationData(AppDataPath, stateName, callback);
}

/**
 * Functions to create the necessary GUI-Elements
 *
 * @param  {[type]}   appID    [description]
 * @param  {[type]}   user     [description]
 * @param  {[type]}   context  [description]
 * @param  {Function} callback [description]
 *
 * @return {[type]}            [description]
 */
RoomState.getGuiElements = function(){
	return this.GuiData;
	
	// this.addInspectorElements(appID, GUIElements[inspector], user, context, callback){

	// }

	// this.addActionSheetElements(appID, GUIElements[toolbar], user, context, callback){

	// }
}

module.exports=RoomState;