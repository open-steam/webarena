"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
var _ = require('lodash');
module.exports=theObject;


/**
 *
 * When an object leaves a tunnel endpoint it isn't connected with the inbox anymore.
 */
theObject.onLeave=function(object,oldData,newData){
	object.setAttribute("tunnel_inbox", false);
};



theObject.decideIfActive = function(object){

	var att = object.getAttribute("tunnel_inbox");
	var source = this.getAttribute("source");

	var res =  att ===  source;
	return  res;
}

theObject.getObjectsFromCommunicationChannel = function(){
    var communicationRoom = "communication_" + this.getAttribute("source") + "_" + this.getRoomID();
    var that = this;

    var requestData = {
        objects: "ALL",
        fromRoom: communicationRoom,
        toRoom: this.getRoomID(),
        cut : true
    };
    Modules.ObjectManager.duplicateNew(requestData, this.context, function(err, idList){
        _(idList).each(function(newObjectId){
            var newObject = Modules.ObjectManager.getObject(that.getRoomID(), newObjectId, that.context);
            newObject.setAttribute("tunnel_inbox", that.getAttribute("source"));
        });
        //that.getRoom().placeActiveObjects();
		that.getRoomAsync(function(){
			//error
		}, function(room){
			if(!room) return;
			room.placeActiveObjectsAsync();
		});
    });
}


theObject.afterCreation = function(){
    var that = this;

    if(this.runtimeData.inboxlistener === undefined){
        this.runtimeData.inboxlistener = function(){
            Modules.EventBus.on("send_object", function(){
                setTimeout(function(){
                    that.getObjectsFromCommunicationChannel();
                }, 1000);
            });
        }

        this.runtimeData.inboxlistener();

        setTimeout(function () {
            that.getObjectsFromCommunicationChannel();
        }, 5000);
    }
}