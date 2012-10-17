/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	if (!object.isActor) {
		console.log(object+' is not an actor!');
		return;
	}
	console.log(object+' left '+this);
	var objects=(this.getLinkedObjects());
	for (var i in objects){
		var obj=objects[i].object;
		obj.hide();
	}
};

theObject.onEnter=function(object,oldData,newData){
	if (!object.isActor) {
		console.log(object+' is not an actor!');
		return;
	}
	console.log(object+' entered '+this);
	var objects=(this.getLinkedObjects());
	for (var i in objects){
		var obj=objects[i].object;
		obj.unhide();
	}
};