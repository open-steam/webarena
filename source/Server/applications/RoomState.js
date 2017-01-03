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

RoomState.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

RoomState.saveState=function(object, data){
	Modules.Connector.saveInventoryState(data.roomID, data.context, data.stateName);
}

RoomState.loadState=function(stateName, callback){
	Modules.Connector.getInventoryState(stateName, callback);
}

RoomState.getSavedStates = function(object, data, callback){
	Modules.Connector.getStateList(data.roomID, function(err, states){
		console.log(states);
		callback(err, states);
	});

}
module.exports=RoomState;