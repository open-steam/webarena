/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
module.exports=theObject;

theObject.sendToRoom = function (roomID, callback){
	var data = {};
	data.roomID = roomID;
	var that = this;

	/* check if room exists already or if it needs to 
	be created.
	*/
	Modules.RoomController.roomExists(data, this.context, function(error, exists){
			if(exists){
				console.log('The room exists');
				Modules.ObjectManager.copyObject(that, roomID, that.context, callback);
			}else{
				Modules.RoomController.createRoom(data, that.context, function(error, success){
					console.log('Room created, object will be copied');
					Modules.ObjectManager.copyObject(that, roomID, that.context, callback);
				});
			}
	});
}

theObject.sendToUserRooms=function(callback){
	
	this.getUserRooms(function(userRooms){
		console.log(userRooms);
		//Here you can do whatever you want to do.
	});
	
	callback('Message to server: It worked!');
}

theObject.sendToRoom.public = true;
theObject.sendToUserRooms.public = true;
