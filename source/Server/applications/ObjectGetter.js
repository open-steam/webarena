/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var ObjectGetter=Object.create(require('./Application.js'));
var objectList={};
var Modules={};

ObjectGetter.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

/**
*	Data should not be part of the function, it should be possible to acquire the necessary 
*	data from the server instead of handing it over. 
*	Problem: Object.context delivers different context
* 	
*/
ObjectGetter.startObjectGetter=function(object, data){
	objectList[object.getAttribute('id')]=object;
	object.context = data.context;
	object.roomID = data.roomID;
	updateAttributes(object);
}

ObjectGetter.onObjectCreated=function(){
	updateAttributes();
}

function updateAttributes(object){
	if (object){
		var objectDataRaw=Modules.ObjectManager.getObjects(object.roomID, object.context);
		var objectData=[];
		for (var i in objectDataRaw){
			var element={};
			element.name=objectDataRaw[i].name;
			element.id=objectDataRaw[i].id;
			element.room=objectDataRaw[i].inRoom;
			objectData.push(element);
		}
		
		object.setAttribute('objectData',objectData);
		return;
	}

	for (var i in objectList){
		process.nextTick(function(){
			updateAttributes(objectList[i]);
		});
	}
	
}

module.exports=ObjectGetter;