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

theObject.onEnter=function(object,data){

	var attribute=this.getAttribute('attribute');
	var value=this.getAttribute('value');
	
	if (!attribute) return;
	
	object.setAttribute(attribute,value);
}

theObject.onLeave=function(object,data){
	
	var attribute=this.getAttribute('attribute');
	
	if (!attribute) return;
	
	object.setAttribute(attribute,undefined);
	
	
}

/*
theObject.evaluate=function(changeData){
	console.log(this.toString(),'evaluate');
	
	var bbox=this.getBoundingBox();
	var x=bbox.x;
	var y=bbox.y;
	var width=bbox.width;
	var height=bbox.height;
	
	var attribute=this.getAttribute('attribute');
	var value=this.getAttribute('value');
	
	var objects=this.getRoom().getInventory();
	
	for (var i in objects){
		var object=objects[i];
		if (object.getAttribute(attribute)==undefined) continue;
		if (object.getAttribute(attribute)==value){
			object.setAttribute('x',x);
			object.setAttribute('y',y);
		}
	}
	
}

*/