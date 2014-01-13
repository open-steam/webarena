/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	this.fireEvent('leave',object);
};

theObject.onEnter=function(object,oldData,newData){
	this.fireEvent('enter',object);
};

theObject.onMoveWithin=function(object,oldData,newData){
	
};

theObject.onMoveOutside=function(object,oldData,newData){
	
};