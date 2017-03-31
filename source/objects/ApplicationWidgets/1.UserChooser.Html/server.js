/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');

theObject.startUserGetter=function(){
	
	this.applicationMessage('startUserGetter');
	
	return 'started';
}
theObject.startUserGetter.public=true;

module.exports=theObject;