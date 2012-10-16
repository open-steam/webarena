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

theObject.encloses=function(otherX,otherY,otherWidth,otherHeight){
	
	var bbox=this.getBoundingBox();
	
	console.log(bbox,otherX,otherY,otherWidth,otherHeight);
	
	if (otherX<bbox.x) return false;
	if (otherY<bbox.y) return false;
	if ((otherX+otherWidth)>(bbox.x+bbox.width)) return false;
	if ((otherY+otherHeight)>(bbox.y+bbox.height)) return false;
	
	return true;
	
}

/**
*	evaluationObjects evaluate other objects in respect to themselves.
*	this is not positioning in front of a background which shall be
*	done by getGreenPositions and getRedPositions
*
*	object the object that shall be evaluated
*	changeData old and new values of positioning (e.g. changeData.old.x) 
**/
theObject.evaluate=function(object,changeData){
	//complete data
	
	var oldData={};
	var newData={};
	var fields=['x','y','width','height'];
	
	for (var i=0;i<4;i++){
		var field=fields[i];
		oldData[field]=changeData['old'][field] || object.getAttribute(field);
		newData[field]=changeData['new'][field] || object.getAttribute(field);
	}
	
	console.log(oldData);
	console.log(newData);
	
	//determine intersections
	
	var oldIntersects=this.encloses(oldData.x,oldData.y,oldData.width,oldData.height);
	var newIntersects=this.encloses(newData.x,newData.y,newData.width,newData.height);
	
	//handle move
	
	if (oldIntersects && newIntersects) return this.onMoveWithin(object,oldData,newData);
	if (!oldIntersects && !newIntersects) return this.onMoveOutside(object,oldData,newData);
	if (oldIntersects && !newIntersects) return this.onLeave(object,oldData,newData);
	if (!oldIntersects && newIntersects) return this.onEnter(object,oldData,newData);
}

theObject.onMoveWithin=function(object,oldData,newData){
	console.log(object+' moved within '+this);
};

theObject.onMoveOutside=function(object,oldData,newData){
	console.log(object+' moved outside of '+this);
};

theObject.onLeave=function(object,oldData,newData){
	console.log(object+' left '+this);
};

theObject.onEnter=function(object,oldData,newData){
	console.log(object+' entered '+this);
};