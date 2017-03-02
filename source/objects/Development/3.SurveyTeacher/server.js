/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
var async = require('async');

module.exports=theObject;

theObject.sendToRoom = function (rooms, attributes, callback){
	var that = this;
	var attr = attributes;
	var resultAttr = {	minValue: attr.minValue, 
						maxValue: attr.maxValue, 
						surveyLength: attr.surveyLength, 
						stepping: attr.stepping,
						statements: attr.statements};


	/* check if room exists already or if it needs to 
	be created.
	*/
		Modules.ObjectManager.createObject(that.getRoomID(), 'SurveyResult', resultAttr, false, that.context, function(error, object){
			attr.resultObjectID = object.id;
			async.each(rooms, function(room, callback) {
				// Perform operation on file here.
			    console.log('Processing file ' + room);
				Modules.ObjectManager.createObject(room, 'SurveyTest', attr, false,that.context, function(error, object){
				});
			    callback();
			}, function(err) {
			    // if any of the file processing produced an error, err would equal that error
			    if( err ) {
			      // One of the iterations produced an error.
			      // All processing will now stop.
			      console.log('A room failed to process');
			    } else {
			      console.log('All rooms have been processed successfully');
			    }
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