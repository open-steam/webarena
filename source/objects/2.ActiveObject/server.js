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

theObject.bBoxEncloses=function(thisX,thisY,thisWidth,thisHeight,otherX,otherY,otherWidth,otherHeight){
	
	if (otherX<thisX-20) {
		//console.log('too far left');
		return false;
	}
	if (otherY<thisY-20) {
		//console.log('too far up');
		return false;
	}
	if ((otherX+otherWidth)>(thisX+thisWidth+20)) {
		//console.log('too far right');
		return false;
	}
	if ((otherY+otherHeight)>(thisY+thisHeight+20)) {
		//console.log('too far bottom');
		return false;
	}
	
	//console.log('intersects');
	return true;	
	
}

/**
*	encloses
*
*	determines, if this Active object fully encloses another object.
*	In this simple implementation, this is done by bounding box comparison.
**/
theObject.encloses=function(otherX,otherY,otherWidth,otherHeight){
	
	if (typeof otherX == 'object'){
		var other=otherX.getBoundingBox();
		otherX=other.x;
		otherY=other.y;
		otherWidth=other.width;
		otherHeight=other.height;
	}
	
	var bbox=this.getBoundingBox();
	
	return this.bBoxEncloses(bbox.x,bbox.y,bbox.width,bbox.height,otherX,otherY,otherWidth,otherHeight);
	
}
/**
*	getOverlappingObjcts
*
*	get an array of all overlapping objects
**/
theObject.getOverlappingObjects=function(){
	var result=[];
	
	var inventory=this.getRoom().getInventory();
	
	for (var i in inventory){
		 var test=inventory[i];
		 if (test.id==this.id) continue;
		 if (this.encloses(test)){
		 	result.push(test);
		 }
	}
	
	return result;
}

/**
*	evaluate is called, when the object itself has been moved or altered
*	
*	ResponsiveObjects should handle this as if other objects would have moved
*	in respect to them (see ResponsiveObject.evaluate)
*
*	Semantiv Objects should rearrange other objects in their evaluation
*
**/
theObject.evaluate=function(changeData){
	//this is different for ResponsiveObjects and SemanticObjects
	this.getRoom().evaluatePositions();
}

/**
*	ActiveObjects evaluate other objects in respect to themselves.
*	this is not positioning in front of a background which shall be
*	done by getGreenPositions and getRedPositions
*
*	object the object that shall be evaluated
*	changeData old and new values of positioning (e.g. changeData.old.x) 
**/
theObject.evaluateObject=function(object,changeData){
	
	//complete data
	
	var oldData={};
	var newData={};
	var fields=['x','y','width','height'];
	
	for (var i=0;i<4;i++){
		var field=fields[i];
		oldData[field]=changeData['old'][field] || object.getAttribute(field);
		newData[field]=changeData['new'][field] || object.getAttribute(field);
	}
	
	//determine intersections
	
	var oldIntersects=this.encloses(oldData.x,oldData.y,oldData.width,oldData.height);
	var newIntersects=this.encloses(newData.x,newData.y,newData.width,newData.height);
	
	//handle move
	
	if (oldIntersects && newIntersects) return this.onMoveWithin(object,newData);
	if (!oldIntersects && !newIntersects) return this.onMoveOutside(object,newData);
	if (oldIntersects && !newIntersects) return this.onLeave(object,newData);
	if (!oldIntersects && newIntersects) return this.onEnter(object,newData);
}


theObject.onMoveWithin=function(object,data){
	
};

theObject.onMoveOutside=function(object,data){
	
};

theObject.onLeave=function(object,data){
	
};

theObject.onEnter=function(object,data){
	
};