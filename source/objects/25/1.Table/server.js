/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
module.exports=theObject;

theObject.onDrop=function(objectID,data){
	this.getRoom().getObject(objectID,function(object){
		setTimeout(function(){
			var type=(object.getAttribute('type'));
			if (type!='VGA' && type!='Wacom') return;
		    object.setAttribute('oldX',object.getAttribute('x'));
		    object.setAttribute('oldY',object.getAttribute('y'));
		    console.log('Saved position for '+object);
		},1000);
	});
}
theObject.onDrop.public=true;

theObject.onLeave=function(object,data){
	var that=this;
	setTimeout(function(){
		var type=(object.getAttribute('type'));
		
		if (type!='VGA' && type!='Wacom') return;
		
		var oldX=object.getAttribute('oldX');
		var oldY=object.getAttribute('oldY');
		
		if (oldY && oldX){
			object.setAttribute('x',oldX);
			object.setAttribute('y',oldY);
		} else {
			console.log(object+' has no saved position.');
		}
		
	},1000);
}