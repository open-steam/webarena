"use strict";

var theObject = Object.create(require('./common.js'));
var Modules = require('../../server.js');
module.exports = theObject;

var async = require('async');
var _ = require('lodash');

theObject.onLeave = function (object, oldData, newData) {
    var eventName = "object::" + this.id + "::leave";
    this.fireEvent(eventName, object.id);
};

theObject.isInCutMode = function () {
    return this.getAttribute("cut");
}

theObject.copyOrCut = function (objectId) {
    var enteredObject = Modules.ObjectManager.getObject(this.getRoomID(), objectId, this.context);
    var targetRoom = this.getAttribute("target");
    var that = this;

    var fromSourceRoom = this.getRoomID();

    /**
     * The function is executed after the "tunnel-action" was called, e.g. the file was copied to another room.
     */
    var sendExecutedHandler = function (err, idList) {
        var copyId = idList[0];
        var eventData = {
            from: fromSourceRoom,
            to: targetRoom,
            objectId: copyId,
            timestamp: new Date().getTime(),
            objectName: enteredObject.getAttribute("name")
        };

        var customKeyValuePair = that.getAttribute('customKeyValuePair');
        if(customKeyValuePair){
            var cPairArray = customKeyValuePair.split(":");
            var key = cPairArray[0];
            var value = cPairArray[1];

            eventData[key] = value;
        }

        //TODO: rebuild with "transport room"
        Modules.EventBus.emit("send_object", eventData);
    }

    //Create communication room
    var getCommunicationChannel = function(cb1){
        //get communication channel ( room )
        var data = {
            from : that.getRoomID(),
            to: targetRoom
        }

        //get communication channel
        Modules.RoomController.getCommunicationChannel(data, that.context, function(err, channelName){
            cb1(null, channelName);
        });
    }

    //Copy data to communication room
    var copyToCommunicationChannel = function(channelName, cb2){
        //send to communication
        var requestData = {
            toRoom: channelName,
            fromRoom: that.getRoomID(),
            objects: [objectId],
            cut: that.isInCutMode()
        }

        Modules.ObjectManager.duplicateNew(requestData, that.context, cb2);
    }

    async.waterfall([getCommunicationChannel, copyToCommunicationChannel], sendExecutedHandler)
}

theObject.copyOrCut.public = true;