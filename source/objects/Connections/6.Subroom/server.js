/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');
module.exports=theObject;

theObject.commonRegister = theObject.register;

theObject.nameChanged=function(value){
	var self=this;
	
	if (!this.getAttribute('destination')) return;
	
	console.log('The destination is '+this.getAttribute('destination'));
	
	Modules.ObjectManager.getRoom(this.getAttribute('destination'), this.context, false, function(destination){
		destination.setAttribute('name',value);
	});
}

theObject.objectCreated = function(callback) {
  
  var self=this;
  
  this.getRoomAsync(function(){
  	Modules.ObjectManager.shout('Could not create the room correctly!');
  },function(parent){
	  Modules.ObjectManager.createSubroom(parent,function(room){
	  		self.setAttribute('destination', room.getAttribute('id'));
	  		if (callback) callback(self);
	  });  	
  });
  

}

theObject.getDestinationRoom = function(callback){
	
	var destination=this.getAttribute('destination');
	
	if (!callback) return callback(undefined);
	
	Modules.ObjectManager.getRoom(destination, this.context, false, callback);
}