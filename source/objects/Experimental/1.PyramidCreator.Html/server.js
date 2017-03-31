/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');

theObject.startPyramid=function(selection){
	
	this.applicationMessage('startPyramid',selection);
	
	return 'started';
}
theObject.startPyramid.public=true;

module.exports=theObject;