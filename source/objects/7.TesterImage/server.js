/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
var exec = require('child_process').exec;

module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	this.checkOverlapping();
};

theObject.onEnter=function(object,oldData,newData){
	this.checkOverlapping();
};

theObject.onMoveWithin=function(object,oldData,newData){
	
};

theObject.onMoveOutside=function(object,oldData,newData){
	
};

theObject.checkOverlapping=function(){
	//exec('say check overlapping');
	
	var hasWrong=false;
	var hasRight=false;
	var rights=0;
	
	var objects=this.getOverlappingObjects();
	for (var i in objects){
		var object=objects[i];
		if (this.getAttribute('key')!=object.getAttribute('key')) continue;
		
		if (this.getAttribute('value')==object.getAttribute('value')) {
			hasRight=true;
			rights++;
		} else {
			hasWrong=true;
		}
	}
	
	if (!hasRight && !hasWrong) {var color='black';}
	if (hasRight && !hasWrong) {var color='green';}
	if (!hasRight && hasWrong) {var color='red';}
	if (hasRight && hasWrong) {var color='orange';}
	
	this.setAttribute('linecolor',color);
	this.setAttribute('linesize',(rights*3)+3);
}