"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){

};

theObject.onEnter=function(object,oldData,newData){

};

theObject.getPositioningDataFor = function(object){
	console.log("try to find position");
}

theObject.decideIfActive = function(object){

	return !! object.hasAttribute("tunnel_inbox_" + this.getAttribute("source"));
}

