"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	var eventName = "object::" + this.id + "::leave"  ;
	this.fireEvent(eventName,object);
};

theObject.onEnter=function(object,oldData,newData){
	var eventName = "object::" + this.id + "::enter"  ;
	this.fireEvent(eventName,object);
};