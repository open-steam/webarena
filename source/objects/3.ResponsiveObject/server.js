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

theObject.evaluate=function(changeData){

	//complete data
	
	var oldData={};
	var newData={};
	var fields=['x','y','width','height'];
	
	for (var i=0;i<4;i++){
		var field=fields[i];
		oldData[field]=changeData['old'][field] || this.getAttribute(field);
		newData[field]=changeData['new'][field] || this.getAttribute(field);
	}
	
	var inventory=this.getRoom().getInventory();
	
	for (var i in inventory){
		
		var object=inventory[i];
		var bbox=object.getBoundingBox();
		
		//determine intersections
	
		var oldIntersects=this.bBoxEncloses(oldData.x,oldData.y,oldData.width,oldData.height,bbox.x,bbox.y,bbox.width,bbox.height);
		var newIntersects=this.bBoxEncloses(newData.x,newData.y,newData.width,newData.height,bbox.x,bbox.y,bbox.width,bbox.height);
		
		//handle move
		
		if (oldIntersects && newIntersects)  this.onMoveWithin(object,newData);
		if (!oldIntersects && !newIntersects)  this.onMoveOutside(object,newData);
		if (oldIntersects && !newIntersects)  this.onLeave(object,newData);
		if (!oldIntersects && newIntersects)  this.onEnter(object,newData);
	}
	
}