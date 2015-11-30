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

	/* case differentiation checks if room exists already or if it needs to 
	be created.
	*/
	Modules.RoomController.roomExists(data, this.context, function(error, exists){
			if(exists){
				console.log('The room exists');
			}else{
				//Asynchroner Aufruf, dementsprechend lieber innerhalb der sucess function copyObject aufrufen
				Modules.RoomController.createRoom(data, that.context, function(error, success){
					console.log('Room created');
				});
			}
			Modules.ObjectManager.copyObject(that, roomID, that.context, callback);
	});
}

theObject.sendToRoom.public = true;