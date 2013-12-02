/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');


//is called when ANY object is repositioned within a room
theObject.evaluatePositionFor=function(object,data){
	
	//when the object is structuring or sensitive ("the background"), its onObjectMove function is called
	
	if (object.onObjectMove) return object.onObjectMove(data);
	
	//if the object is not active (neutral) do nothing at all
	
	//if (!object.isActive()) return;
	
	//let the moved object be evaluated by every structuring or sensitive object in the room
	
	var inventory=this.getInventory();
	
	for (var i in inventory){
		var obj=inventory[i];
		if (obj.isStructuring() || obj.isSensitive()) {
			obj.evaluateObject(object,data);
		}
	}
	
}

//sets active objects to their positions
theObject.placeActiveObjects=function(){
	
	var objects=this.getInventory();
	
	for (var key in objects){
		var active=objects[key];
		var currentIsActive;
		if(active.isActive === "function"){
			currentIsActive = active.isActive();
		}
		if (currentIsActive !== false){
			for (var key2 in objects){
				var structuring=objects[key2];
				if (structuring.isStructuring()){
					if(currentIsActive || structuring.decideIfActive(active)){
						var data=structuring.getPositioningDataFor(active);
						console.log(active+' structured by '+structuring+' '+data);
					}
				}
			}
		}
	}
	
	//get all structuring objects
	//get all active objects
	
	//for every active object, get possible positions
	//position them
	
}

function getPosition(dataObject,green,reds){
	
	//TODO choose more random positions.
	
	for (var x=green.x;x<=green.x2;x++){
		for (var y=green.y;y<green.y2;y++){
			
			var inRed=false;
			for (var i in reds){
				var red=reds[i];
				if ((x>red.x && x+w<red.x2) && (y>red.y && y+h<red.y2)){
					inRed=true;
					break;
				}
			}
			if (inRed) continue;
			
			return {'x':x,'y':y};
		}
	}
	
	return false;
	
}

function checkPosition(dataObject,green,reds){
	
	var x=dataObject.getAttribute('x');
	var y=dataObject.getAttribute('y');
	var w=dataObject.getAttribute('width');
	var h=dataObject.getAttribute('height');
	
	if (green){
		if (x<green.x ||x+w>green.x2 || y<green.y ||y+h>green.y2){
			console.log(dataObject+' out of green');
			return false;
		}
	} else {
		console.log(dataObject+' has no green');
	}
	
	if (reds.length){
		for (var i in reds){
			var red=reds[i];
			if ((x>red.x && x+w<red.x2) && (y>red.y && y+h<red.y2)){
				console.log(dataObject+' in red');
				return false;
			}
		}
	} else {
		console.log(dataObject+' has no red');
	}
	
	console.log('Position of '+dataObject+' is okay.');
	return true;
	
}

theObject.getInventory=function(){
	return Modules.ObjectManager.getObjects(this.id,this.context);
}

theObject.createObject=function(type,callback){	
    return Modules.ObjectManager.createObject(this.id, type, false, false, this.context.socket, false, callback);
}

module.exports=theObject;