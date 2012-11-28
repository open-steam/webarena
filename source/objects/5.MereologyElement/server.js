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