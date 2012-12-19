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

theObject.getGreenPositions=function(object){
	
	var attribute=this.getAttribute('attribute');
	var value=this.getAttribute('value');
	
	if (object.getAttribute(attribute)==undefined) return false;
	
	if (object.getAttribute(attribute)==value){
		var result={};
		result.x=this.getAttribute('x');
		result.y=this.getAttribute('y');
		result.width=this.getAttribute('width');
		result.height=this.getAttribute('height');
		return result;
	} else return false;
	
}

theObject.getRedPositions=function(object){
	
	var attribute=this.getAttribute('attribute');
	var value=this.getAttribute('value');
	
	if (object.getAttribute(attribute)==undefined) return false;
	
	if (object.getAttribute(attribute)==value) {
		return false;
	}else {
		var result={};
		result.x=this.getAttribute('x');
		result.y=this.getAttribute('y');
		result.width=this.getAttribute('width');
		result.height=this.getAttribute('height');
		return result;
	}
	
}