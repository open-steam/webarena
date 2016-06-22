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

theObject.clearTrash=function(callback){
    var currentRoom = this.context.room.id;
    var that = this;
    Modules.ObjectManager.getObjects("trash",this.context,function(inventory){
        var objectArray = new Array();
		for(var i = 0; i<inventory.length; i++){
			var oldRoom = inventory[i].getAttribute("oldRoomID");
            if(currentRoom == oldRoom){
                var objectID = inventory[i].id;
                var removeObject = Modules.ObjectManager.getObject("trash", objectID, that.context);
                Modules.ObjectManager.remove(removeObject);
            }
		}
        callback();
    });
    
    
}
theObject.clearTrash.public = true;

theObject.getRecentChanges.public = true;
	
module.exports=theObject;