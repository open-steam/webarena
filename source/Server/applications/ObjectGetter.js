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
var _ = require('underscore');

ObjectGetter.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

ObjectGetter.startObjectGetter=function(object){
	objectList[object.getAttribute('id')]=object;
	updateAttributes(object);
}

ObjectGetter.onObjectCreated=function(){
	updateAttributes();
}

ObjectGetter.onObjectDeleted=function(){
	updateAttributes();
}

ObjectGetter.onSetAttribute=function(){
	updateAttributes();
}

function updateAttributes(object){
	var objectData = [];
	if (object){
		//Should use a checkbox instead of string
		if(object.getAttribute('Targetroom') != 'all'){
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
			Modules.RoomController.listRooms(object.context, function(err, rooms){
				for(var i = 0; i < rooms.length; i++){
					Modules.ObjectManager.getObjects(rooms[i].id, object.context, function(inventory){
						//Applying filters should happen here
						for (var i in inventory){
							var element={};
							element.name=inventory[i].getAttribute('name');
							element.id=inventory[i].id;
							element.room = inventory[i].inRoom;

							objectData.push(element);
						}

						//instead of the notify boolean its probably possible to use async concat
						//to make sure that objectData is only set when all objects are aggregated
						object.setAttribute('objectData',objectData, false, false);
					});
				}
			});
		}	
	}else{
		for (var i in objectList){
			process.nextTick(function(){
				updateAttributes(objectList[i]);
			});
		}	
	}
}

module.exports=ObjectGetter;