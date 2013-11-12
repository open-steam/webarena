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
	var that = this;
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
		cut : that.isInCutMode()
	}

	/**
	 * The function is executed after the "tunnel-action" was called, e.g. the file was copied to another room.
	 */
	var sendExecutedHandler = function(idList){
		console.log("copied...with new id: " + idList);

		var copyId = idList[0];
		var thecopy = Modules.ObjectManager.getObject(requestData.toRoom,  copyId, that.context);

		//TODO: remove timeout - only there for debug purpose
		setTimeout(function(){
			console.log("set args to: ∂..." + requestData.fromRoom);
			thecopy.setAttribute("tunnel_inbox", requestData.fromRoom);
		}, 2000);

	}

	Modules.ObjectManager.duplicate(this.context.socket, requestData, false, sendExecutedHandler);
}



theObject.onEnter=function(object,oldData,newData){
	this.duplicationLogic(object);
};

