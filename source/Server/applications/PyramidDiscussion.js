/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var PyramidDiscussion=Object.create(require('./Application.js'));
var async=require('async');
var objectList={};
var Modules={};

PyramidDiscussion.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

PyramidDiscussion.startPyramid=function(object,selection){
	console.log('startPyramid '+object+' ',selection);
	
	object.setAttribute('x',10);
	object.setAttribute('y',150);
	
	this.initRoom=object.getRoom();
	
	var self=this;
	
	//create the teacher room
	
	this.initRoom.createObject('Subroom',function(error,subroomObject){
		
		
		subroomObject.getDestinationRoom(function(teacherRoom){
			
			subroomObject.setAttribute('name','Pyramiden-Lehrersicht');
			subroomObject.setAttribute('x',10);
			subroomObject.setAttribute('y',10);
			self.teacherRoom=teacherRoom;
			
		});
		
	});
	
	this.participantRooms={};
	var subroomObjects=[];
	
	//create participant rooms
	async.each(selection, function(entry,callback){
		
		if (entry.selected){
			
			self.initRoom.createObject('Subroom',function(error,subroomObject){
		
		
				subroomObject.getDestinationRoom(function(participantRoom){
					
					subroomObject.setAttribute('name',entry.value);
					self.participantRooms[entry.value]=participantRoom;
					subroomObjects.push(subroomObject);
					callback(null);
					
				});
				
			});
			
			
		} else {
			callback(null);
		}
		
	}, function(err){
	    // if any of the saves produced an error, err would equal that error
	    
	    for (var i in subroomObjects){
	    	var subroomObject=subroomObjects[i];
	    	i=i*1.0;
	    	subroomObject.setAttribute('x',((1+i)*100)+10);
			subroomObject.setAttribute('y',10);
	    }
	    
	    //self.teacherRoom.enter();
	    
	});
	
	//remove all pyramid-objects in this room
	//create new pyramid objects here
	//send every participant into his own room
	//copy every first level text to the participants rooms
}


PyramidDiscussion.onPyramidStoneReadyChanged=function(object,value){
	//save the changed state
	//if "both" children are ready, copy the next level to the participants rooms
}

module.exports=PyramidDiscussion;