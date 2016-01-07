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

theObject.sendToRoom = function (roomID, attributes, callback){
	var data = {};
	data.roomID = roomID;
	var that = this;
	var attr = attributes;


	/* check if room exists already or if it needs to 
	be created.
	*/
	Modules.RoomController.roomExists(data, this.context, function(error, exists){
		console.log('The room exists');

		Modules.ObjectManager.createObject(that.getRoomID(), 'SurveyResult', false, false, that.context, function(error, object){

			attr.resultObjectID = object.id;

			Modules.ObjectManager.createObject(roomID, 'SurveyTest', attr, false,that.context, function(error, object){
				console.log('resultObjectID ' + attr.resultObjectID);
				console.log('room ' + attr.resultObjectRoom);
			});	
		});
	});
}

theObject.getUserRoomList=function(callback){
	var roomList = [];

	this.getUserRooms(function(userRooms){
	//iterate users and push roomIDs into array	
		for (var index in userRooms) {
    		if (userRooms.hasOwnProperty(index)) {
    			roomList.push(userRooms[index].id);
    		}
		}

		//return the roomList
		callback(roomList);
	});
}

theObject.sendToRoom.public = true;
theObject.getUserRoomList.public = true;