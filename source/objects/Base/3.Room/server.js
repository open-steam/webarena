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

	//when the object is structuring, its onObjectMove function is called
	
	if (object.onObjectMove) {
		return object.onObjectMove(data);
	} else {
	
		//let the moved object be evaluated by every structuring object in the room
		
		var inventory=this.getInventory();
		
		for (var i in inventory){
			var obj=inventory[i];
			if (obj.isStructuring()) {
				obj.evaluateObject(object,data);
			}
		}
	}
	
}


theObject.getInventory=function(){
	return Modules.ObjectManager.getObjects(this.id,this.context);
}

theObject.getInventoryAsync = function(cb){
    return Modules.ObjectManager.getObjects(this.id, this.context, cb);
}

theObject.getObject=function(objID,callback){
	this.getInventoryAsync(function(inventory){
		for(var i in inventory){
			var candidate=inventory[i];
			if (candidate.id==objID) {
				callback(candidate);
			}
		}
	});
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