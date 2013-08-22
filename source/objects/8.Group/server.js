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

theObject.onLeave=function(object,oldData,newData){
	
	if (this.checkData()){
		console.log(this.getData());
	}

};

theObject.onEnter=function(object,oldData,newData){
	
	if (this.checkData()){
		console.log(this.getData());
	}
};

theObject.onMoveWithin=function(object,oldData,newData){
	
	return this.onEnter(object,oldData,newData);
		
};

theObject.onMoveOutside=function(object,oldData,newData){
	
	return this.onLeave(object,oldData,newData);
	
};

theObject.getData=function(){
	var attribute=this.getAttribute('attribute');
	var value=this.getAttribute('value');
	return {'attribute':attribute,'value':value};	
}

theObject.checkData=function(){
	var data=this.getData();
	
	if (!data.attribute || !data.value){
		console.log(this +' has unsufficient data.'); //TODO shout back to people in the room
		return false;
	}
	
	return true;
}

//theObject.getPositioningLimitsFor=function(activeObject){
	
