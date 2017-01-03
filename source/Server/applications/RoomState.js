/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var RoomState=Object.create(require('./Application.js'));
var objectList={};
var Modules={};

/** Initializes the function
 *
 * @param  {[type]} Description
 * @param  {[type]} Description
 *
 * @return {[type]}
 */
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
	Modules.Connector.saveInventoryState(data.roomID, data.context, data.stateName);
}

/*
*	Restores the selected state from a radio-input selection
*
*	@param  {[selection]} An array of objects (selection.value, selection.selected)
*/
RoomState.restoreState=function(selection){
	for(var entry in selection){
		if(selection[entry].selected == true){
			console.log(selection[entry].value+' wurde gewählt');
		}
	}
}

/*
*	Returns the list of currently saved states
*
*
*/
RoomState.getSavedStates = function(object, data, callback){
	Modules.Connector.getStateList(data.roomID, function(err, states){
		callback(err, states);
	});

}
module.exports=RoomState;