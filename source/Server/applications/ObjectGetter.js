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
ObjectGetter.startObjectGetter=function(object){
	objectList[object.getAttribute('id')]=object;
	updateAttributes(object);
}

ObjectGetter.onObjectCreated=function(){
	updateAttributes();
}

function updateAttributes(object){
	if (object){
		//TODO: Use async method
		Modules.ObjectManager.getObjects(object.getAttribute('Targetroom'), object.context, function(inventory){
				var objectData=[];
				//Applying filters should happen here
				for (var i in inventory){
					var element={};
					
					element.name=inventory[i].getAttribute('name');
					element.id=inventory[i].id;
					element.room=inventory[i].inRoom;
					objectData.push(element);
				}
				
				object.setAttribute('objectData',objectData);
			});
			
	}else{
		for (var i in objectList){
			process.nextTick(function(){
				updateAttributes(objectList[i]);
			});
		}	
	}
}

module.exports=ObjectGetter;