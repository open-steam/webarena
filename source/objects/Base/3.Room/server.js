/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2013
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../../server.js');


//is called when ANY object is repositioned within a room
theObject.evaluatePositionFor=function(object,data){
	
	//when the object is structuring or sensitive ("the background"), its onObjectMove function is called
	
	if (object.onObjectMove) return object.onObjectMove(data);
	
	//let the moved object be evaluated by every structuring or sensitive object in the room
	
	this.getInventoryAsync(function(inventory){
		for (var i in inventory){
			var obj=inventory[i];
			if (obj.isStructuring() || obj.isSensitive()) {
				obj.evaluateObject(object,data);
			}
		}
	});
	
}


theObject.getInventory=function(){
	console.log('>>>> Synchronous getInventory in Room');
	return Modules.ObjectManager.getObjects(this.id,this.context);
}

theObject.getInventoryAsync = function(cb){
    return Modules.ObjectManager.getObjects(this.id, this.context, cb);
}


theObject.hasObject=function(obj){
	console.log('>>>> Synchronous hasObject in Room');
	
	var inventory=this.getInventory();
	for (var i in inventory){
		if (inventory[i].id==obj.id) return true;
	}
	return false;
}

theObject.hasObjectAsync=function(obj,trueCB,falseCB){
	
	this.getInventoryAsync(function(inventory){
		
		if (trueCB){
			for (var i in inventory){
				if (inventory[i].id==obj.id) return trueCB();
			}
			if (falseCB) falseCB();
		}
		
	});
}


theObject.createObject=function(type,callback){	
    return Modules.ObjectManager.createObject(this.id, type, false, false, this.context, callback);
}

theObject.saveUserPaintingData=function(content,callback){
	var self = this;
	
	if (content.substr(0,22)=='data:image/png;base64,'){
		
		var base64Data = content.replace(/^data:image\/png;base64,/,""),
		content = new Buffer(base64Data, 'base64');
	}
	
	Modules.Connector.savePainting(this.inRoom, content, this.context, function() {
		if (callback) callback();
		self.updateClients('paintingsUpdate');
	});
	
	
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
	
	Modules.Connector.deletePainting(this.inRoom, this.context, function() {
		self.updateClients('paintingsUpdate');
	});
	
}
theObject.deleteUserPainting.public = true;
theObject.deleteUserPainting.neededRights = {
    write : true
}


/**
*	returns the objects which were deleted in the current room (special format for JSTree!)
*/
theObject.getDeletedObjects = function(cb){

	var that = this;
	
    Modules.ObjectManager.getObjects("trash", this.context, function(objects){
		
		var objectArray = new Array();
		
		for(var i = 0; i<objects.length; i++){
			var oldRoom = objects[i].getAttribute("oldRoomID");
			if(that.id == oldRoom){
		
				var id = objects[i].getAttribute('id');
				var type = objects[i].getAttribute('type');
				var name = objects[i].getAttribute('name');
			
				var node = {
					data : {
						title : name,
						icon : '/objectIcons/'+type
					},
					metadata : {
						id : id,
						name : name,
						type : type,
						inRoom : oldRoom
					}
				}
				objectArray.push(node);
			}
		}
		cb(objectArray);
	});
}

theObject.getDeletedObjects.public = true;

theObject.getRecentChanges = function(data, cb){

	var history = Modules.ObjectManager.history.getHistoryEntries();
	
	var arr = [];
	
	for(var i in history){
		var entry = history[i].changeSet[0];
		if(entry.roomID == data.roomID){
			entry.user = history[i].userId;
	
			var date = new Date(parseInt(i));
			var day = date.getDate();
			var year = date.getFullYear();
			var hours = date.getHours();
			var minutes = date.getMinutes();
			var month = date.getMonth()+1;
			
			if(minutes < 10){
				minutes = '0'+minutes;
			}
			
			entry.date = day+'.'+month+'.'+year+', '+hours+':'+minutes;

			arr.push(entry);
		}
	}
	
	cb(arr);
	
}
	
theObject.getRecentChanges.public = true;	
	
module.exports=theObject;