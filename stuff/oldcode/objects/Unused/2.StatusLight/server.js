/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');

theObject.getCurrentMileStoneStatus = function(callback){
    var eventName = "applicationevent::kokoa::getMilestoneState";
    var event = {
        proceedingId : this.getAttribute("proceedingID"),
        callback : callback
    }
    Modules.EventBus.emit(eventName, event);
}
theObject.getCurrentMileStoneStatus.public = true;

theObject.getContentFromApplication = function(applicationName, callback){
    var eventName = "applicationevent::" + applicationName + "::getContent"
    var event = {
        proceedingId : this.getAttribute("proceedingID"),
        callback : callback
    }
    Modules.EventBus.emit(eventName, event);
}
theObject.getContentFromApplication.public = true;

theObject.saveMilestoneChanges = function(changedData, callback){
    var eventName = "applicationevent::kokoa::saveMilestones"
    var event = {
        proceedingId : this.getAttribute("proceedingID"),
        milestoneChanges : changedData,
        callback : callback
    }
    Modules.EventBus.emit(eventName, event);
}
theObject.saveMilestoneChanges.public = true;


module.exports=theObject;