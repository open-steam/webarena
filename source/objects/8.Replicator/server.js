"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	var eventName = "object::" + this.id + "::leave"  ;
	this.fireEvent(eventName,object);
};

theObject.onEnter=function(object,oldData,newData){
	var objectId = object.id;
	var eventName = "object::" + this.id + "::enter"  ;
	this.fireEvent(eventName,object);

	//TODO: handle if not set
	var targetRoom = this.getAttribute("target");

	var requestData = {
		toRoom : targetRoom,
		fromRoom : this.getRoomID(),
		objects : [objectId],
		cut : false
	}

	var that = this;



	Modules.ObjectManager.duplicate(that.context.socket, requestData, function(idList){
		console.log("copied...with new id: " + idList);
	});
};