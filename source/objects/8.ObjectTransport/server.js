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

theObject.copyOrCut = function(objectId){
    var enteredObject = Modules.ObjectManager.getObject(this.getRoomID(), objectId, this.context);

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
	var sendExecutedHandler = function(err, idList){
		var copyId = idList[0];
		var thecopy = Modules.ObjectManager.getObject(requestData.toRoom,  copyId, that.context);

        thecopy.setAttribute("tunnel_inbox", requestData.fromRoom);

        //TODO: rebuild with "transport room"
        Modules.EventBus.emit("send_object", {
           from : requestData.fromRoom,
           to : requestData.toRoom,
           objectId : copyId,
           timestamp : new Date().getTime(),
           objectName : enteredObject.getAttribute("name")
        });
	}

	Modules.ObjectManager.duplicateNew(requestData, this.context, sendExecutedHandler);
}

theObject.copyOrCut.public = true;