/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');

theObject.startObjectGetter=function(){
	this.applicationMessage('startObjectGetter');
	
	return 'started';
}

theObject.startObjectGetter.public=true;

module.exports=theObject;