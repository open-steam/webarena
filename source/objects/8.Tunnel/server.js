"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	var eventName = "object::" + this.id + "::leave"  ;
	this.fireEvent(eventName,object.id);
};

theObject.onEnter=function(object,oldData,newData){
	var objectId = object.id;
	var eventName = "object::" + this.id + "::enter"  ;
	this.fireEvent(eventName,  {
		enteredElementID : objectId,
		sourceType : this.getType()
	});

	//TODO: handle if not set
	var targetRoom = this.getAttribute("target");

	var requestData = {
		toRoom : targetRoom,
		fromRoom : this.getRoomID(),
		objects : [objectId],
		cut : true
	}

	var that = this;

	var afterDuplication = function(idList){
		console.log("copied...with new id: " + idList);
		var copyId = idList[0];
		var thecopy = Modules.ObjectManager.getObject(requestData.toRoom,  copyId, that.context);

		//TODO: remove timeout - only there for debug purpose
		setTimeout(function(){
			thecopy.setAttribute("tunnel_inbox", requestData.fromRoom);
		}, 2000);
	}

	Modules.ObjectManager.duplicate(that.context.socket, requestData, false, afterDuplication);
};

