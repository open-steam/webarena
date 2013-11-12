"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	var eventName = "object::" + this.id + "::leave"  ;
	this.fireEvent(eventName,object.id);
};

theObject.isInCutMode = function(){
	return this.getAttribute("cut");
}

theObject.duplicationLogic = function(enteredObject){
	var objectId = enteredObject.id;
	var eventName = "object::" + this.id + "::enter"  ;
	this.fireEvent(eventName,  {
		enteredElementID : objectId,
		sourceType : this.getType()
	});



	//TODO: handle if not set
	var targetRoom = this.getAttribute("target");
	var that = this;
	var requestData = {
		toRoom : targetRoom,
		fromRoom : this.getRoomID(),
		objects : [objectId],
		cut : that.isInCutMode()
	}

	Modules.ObjectManager.duplicate(this.context.socket, requestData, false, this.sendExecutedHandler);
}

/**
 * The function is executed after the "tunnel-action" was called, e.g. the file was copied to another room.
 */ 
theObject.sendExecutedHandler = function(newIds){
	console.log("copied...with new id: " + idList);
	var copyId = idList[0];
	var thecopy = Modules.ObjectManager.getObject(requestData.toRoom,  copyId, that.context);

	//TODO: remove timeout - only there for debug purpose
	setTimeout(function(){
		thecopy.setAttribute("tunnel_inbox", requestData.fromRoom);
	}, 2000);

}

theObject.onEnter=function(object,oldData,newData){
	this.duplicationLogic(object);
};

