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

/**
*	evaluationObjects evaluate other objects in respect to themselves.
*	this is not positioning in front of a background which shall be
*	done by getGreenPositions and getRedPositions
*
*	object the object that shall be evaluated
*	changeData old and new values of positioning (e.g. changeData.old.x) 
**/
theObject.evaluate=function(object,changeData){
	
}