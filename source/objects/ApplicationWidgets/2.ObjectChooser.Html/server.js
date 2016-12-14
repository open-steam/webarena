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
	var data = {}
	data.roomID = this.get('inRoom');
	data.context = this.context;
	this.applicationMessage('startObjectGetter', data);
	
	return 'started';
}
theObject.startObjectGetter.public=true;

module.exports=theObject;