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

theObject.onDrop=function(droppedID){
	
	console.log(this+' onDrop');
	
	var droppedObject=this.getObject(droppedID);
	
    var destinationRoomId = this.getAttribute('destination');
    
    var self=this;
	
	Modules.ObjectManager.getRoom(destinationRoomId, this.context, false, function(room){
		
		//determine the destination BlackHole in the target room
	
		room.getInventoryAsync(function(objects){
			
			//see if there is a blackHole with the current room as destination
			
			var endPoint=false;
			
			for (var i in objects){
				var candidate=objects[i];
				if(candidate.getAttribute('type')==self.getAttribute('type')){
					//we found a BlackHoleEndPoint
					if (candidate.getAttribute('destination')==self.inRoom){
						//we found our endPoint
						endPoint=candidate;
						console.log('Found endPoint '+candidate);
					}
				}
			}
			
			var moveToEndPoint=function(endPoint){
				droppedObject.moveToRoom(endPoint.inRoom,function(error,newObject){
					newObject.setAttribute('x',endPoint.getAttribute('x'));
					newObject.setAttribute('y',endPoint.getAttribute('y'));
				});
			}
			
			//create a new EndPoint if none was found
			if (!endPoint){
				console.log('Creating new end point in '+room);
				room.createObject(self.getAttribute('type'),function(error,endPoint){
					//letting the new endPoint point to this room.
					endPoint.setAttribute('destination',self.inRoom);
					moveToEndPoint(endPoint);
				});
			} else {
				moveToEndPoint(endPoint);
			}
			
			
		});
		
	});
	
}