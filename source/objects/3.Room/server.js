/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2013
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');


//is called when ANY object is repositioned within a room
theObject.evaluatePositionFor=function(object,data){
	
	//when the object is structuring or sensitive ("the background"), its onObjectMove function is called
	
	if (object.onObjectMove) return object.onObjectMove(data);
	
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
	
	var positions={};
	
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
						if (data.reference!=='ignore'){
							if (!positions[active.id]) positions[active.id]={object:active,musts:[],mustnots:[]};
							if (data.reference=='must') {
								positions[active.id].musts.push(data);
							} else {
								positions[active.id].mustnots.push(data);
							}
						}
					}
				}
			}
		}
	}
	
	
	for (var i in positions){
		var task=positions[i];
		var object=task.object;
		var musts=task.musts;
		var mustnots=task.mustnots;
		
		var x=object.getAttribute('x');
		var y=object.getAttribute('y');
		
		//check if position is still okay; 
		var isOK=true;
		
		for (var i in musts){
			var must=musts[i];
			if (x<must.minX || x>must.maxX || y<must.minY || y>must.maxY) {
				var isOK=false;
				break;
			}
		}
		
		if (isOK){
			for (var i in mustnots){
				var mustnot=mustnots[i];
				if (x>mustnot.minX && x<mustnot.maxX && y>mustnot.minY && y<mustnot.maxY) {
					var isOK=false;
					break;
				}				
			}
		}
		
		if (isOK){
			//position does not need to be changed
			continue;
		} else {
			
			var conflicts=false;
			
			if (musts.length){
				var first=musts.pop();
				var minX=first.minX;
				var maxX=first.maxX;
				var minY=first.minY;
				var maxY=first.maxY;
				
				for (var i in musts){
					var must=musts[i];
					
					var intersects=!(  must.minX>maxX 
					 				|| must.maxX<minX
					 				|| must.minY>maxY
					 				|| must.maxY<minY);
					 			
					 if (!intersects){
					 	conflicts=true;
					 	break;	
					 }	 
					 
					 minX=Math.max(must.minX,minX);
					 minY=Math.max(must.minY,minY);
					 
					 maxX=Math.min(must.maxX,maxX);
					 maxY=Math.min(must.maxY,maxY);
					 
				}
				
			}
			
			if (conflicts) {
				object.setAttribute('visible',false);
				continue;
			}
			
			var newX=Modules.Helper.getRandom(minX,maxX);
			var newY=Modules.Helper.getRandom(minY,maxY);
			
			//TODO include mustnots
			
			object.setAttribute('x',newX);
			object.setAttribute('y',newY);
			object.setAttribute('visible',true);
			
		}
	
	}
	
	//get all structuring objects - check
	//get all active objects - check
	
	//for every active object, get possible positions - check
	//position them
	
}

theObject.getInventory=function(){
	return Modules.ObjectManager.getObjects(this.id,this.context);
}

theObject.getInventoryAsync = function(cb){
    return Modules.ObjectManager.getObjects(this.id, this.context, cb);
}

theObject.createObject=function(type,callback){	
    return Modules.ObjectManager.createObject(this.id, type, false, false, this.context.socket, false, callback);
}

theObject.saveUserPaintingData=function(content,callback){
	var self = this;
	
	if (content.substr(0,22)=='data:image/png;base64,'){
		
		var base64Data = content.replace(/^data:image\/png;base64,/,""),
		content = new Buffer(base64Data, 'base64');
	}
	
	Modules.Connector.savePainting(this.inRoom, content, function() {
		if (callback) callback();
		self.updateClients('paintingsUpdate');
	},this.context);
	
	
}
theObject.saveUserPaintingData.public = true;
theObject.saveUserPaintingData.neededRights = {
    write : true
}

theObject.getUserPaintings=function(callback){
	
	Modules.Connector.getPaintings(this.inRoom,this.context,function(rawData){
		
		//This data should be improved
		callback(rawData);
		
	});
	
}
theObject.getUserPaintings.public = true;
theObject.getUserPaintings.neededRights = {
    read : true
}

theObject.deleteUserPainting=function(){
	var self = this;
	
	Modules.Connector.deletePainting(this.inRoom, function() {
		self.updateClients('paintingsUpdate');
	},this.context);
	
}
theObject.deleteUserPainting.public = true;
theObject.deleteUserPainting.neededRights = {
    write : true
}

module.exports=theObject;