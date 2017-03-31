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
var async = require('async');
const util = require('util')


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
				var getObjects = function(room,callback){
					Modules.ObjectManager.getObjects(room.id, object.context, function(inventory){
						callback(err, inventory);
					});
				}
				var self = this;

				async.concat(rooms, getObjects, function(err, inventory){
					var objectData = [];
					for (var i in inventory){
							var element = {};

							element.name=inventory[i].getAttribute('name');
							element.id=inventory[i].id;
							element.room=inventory[i].inRoom;

							objectData.push(element);
						}

    				object.setAttribute('objectData', objectData);
				});
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