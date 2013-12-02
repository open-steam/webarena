/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject server component
*
*/

"use strict";

// The server side defintion of the object extends the common parts

var theObject=Object.create(require('./common.js'));

// The Modules variable provides access to server modules such as
// Module.ObjectManager

var Modules=require('../../server.js');
var _ = require('underscore');

// Make the object public
module.exports=theObject;


// ****************************************************************
// * MAKE SENSITIVE ***********************************************
// ****************************************************************

theObject.makeSensitive=function(){
	this.isSensitiveFlag=true;
	
	var theObject=this;
	
	this.onObjectMove=function(changeData){
	
		//complete data
		
		var oldData={};
		var newData={};
		var fields=['x','y','width','height'];
		
		for (var i=0;i<4;i++){
			var field=fields[i];
			oldData[field]=changeData['old'][field] || this.getAttribute(field);
			newData[field]=changeData['new'][field] || this.getAttribute(field);
		}
		
		var inventory=this.getRoom().getInventory();
		
		for (var i in inventory){
			
			var object=inventory[i];
			
			if(object.id==this.id) continue;
			
			var bbox=object.getBoundingBox();
			
			//determine intersections
		
			var oldIntersects=this.bBoxEncloses(oldData.x,oldData.y,oldData.width,oldData.height,bbox.x,bbox.y,bbox.width,bbox.height);
			var newIntersects=this.bBoxEncloses(newData.x,newData.y,newData.width,newData.height,bbox.x,bbox.y,bbox.width,bbox.height);
			
			//handle move
			
			if (oldIntersects && newIntersects)  this.onMoveWithin(object,newData);
			if (!oldIntersects && !newIntersects)  this.onMoveOutside(object,newData);
			if (oldIntersects && !newIntersects)  this.onLeave(object,newData);
			if (!oldIntersects && newIntersects)  this.onEnter(object,newData);
		}
		
	}
	
	
	theObject.bBoxEncloses=function(thisX,thisY,thisWidth,thisHeight,otherX,otherY,otherWidth,otherHeight){
		
		if (otherX<thisX-20) {
			//console.log('too far left');
			return false;
		}
		if (otherY<thisY-20) {
			//console.log('too far up');
			return false;
		}
		if ((otherX+otherWidth)>(thisX+thisWidth+20)) {
			//console.log('too far right');
			return false;
		}
		if ((otherY+otherHeight)>(thisY+thisHeight+20)) {
			//console.log('too far bottom');
			return false;
		}
		
		//console.log('intersects');
		return true;	
		
	}
	
	/**
	*	encloses
	*
	*	determines, if this Active object fully encloses another object.
	*	In this simple implementation, this is done by bounding box comparison.
	**/
	theObject.encloses=function(otherX,otherY,otherWidth,otherHeight){
		
		if (typeof otherX == 'object'){
			var other=otherX.getBoundingBox();
			otherX=other.x;
			otherY=other.y;
			otherWidth=other.width;
			otherHeight=other.height;
		}
		
		var bbox=this.getBoundingBox();
		
		return this.bBoxEncloses(bbox.x,bbox.y,bbox.width,bbox.height,otherX,otherY,otherWidth,otherHeight);
		
	}
	/**
	*	getOverlappingObjcts
	*
	*	get an array of all overlapping objects
	**/
	theObject.getOverlappingObjects=function(){
		var result=[];
		
		var inventory=this.getRoom().getInventory();
		
		for (var i in inventory){
			 var test=inventory[i];
			 if (test.id==this.id) continue;
			 if (this.encloses(test)){
			 	result.push(test);
			 }
		}
		
		return result;
	}
	
	
	/**
	*	SensitiveObjects evaluate other objects in respect to themselves.
	*
	*	object the object that shall be evaluated
	*	changeData old and new values of positioning (e.g. changeData.old.x) 
	**/
	theObject.evaluateObject=function(object,changeData){
		
		//complete data
		
		var oldData={};
		var newData={};
		var fields=['x','y','width','height'];
		
		for (var i=0;i<4;i++){
			var field=fields[i];
			oldData[field]=changeData['old'][field] || object.getAttribute(field);
			newData[field]=changeData['new'][field] || object.getAttribute(field);
		}
		
		//determine intersections
		
		var oldIntersects=this.encloses(oldData.x,oldData.y,oldData.width,oldData.height);
		var newIntersects=this.encloses(newData.x,newData.y,newData.width,newData.height);
		
		//handle move
		
		if (oldIntersects && newIntersects) return this.onMoveWithin(object,newData);
		if (!oldIntersects && !newIntersects) return this.onMoveOutside(object,newData);
		if (oldIntersects && !newIntersects) return this.onLeave(object,newData);
		if (!oldIntersects && newIntersects) return this.onEnter(object,newData);
	}
	
	if (!theObject.onMoveWithin) theObject.onMoveWithin=function(object,data){
		
	};
	
	if (!theObject.onMoveOutside) theObject.onMoveOutside=function(object,data){
		
	};
	
	if (!theObject.onLeave) theObject.onLeave=function(object,data){
		
	};
	
	if (!theObject.onEnter) theObject.onEnter=function(object,data){
		
	};

}


// ****************************************************************
// * MAKE STRUCTURING *********************************************
// ****************************************************************

theObject.makeStructuring=function(){
	this.isStructuringFlag=true;
	this.makeSensitive();
	this.isSensitiveFlag=false;
	
	this.onObjectMove=function(changeData){
		
		//when a structuring object is moved, every active object may be in need of repositioning
		
		console.log('onObjectMove on structuring object '+this);
		
		this.getRoom().placeActiveObjects();
	}
	
	if (!this.getPositioningDataFor) this.getPositioningDataFor=function(activeObject){
		
		var result={reference:'ignore'};
		
		//reference: must, mustnot, ignore
		//minX
		//maxX
		//minY
		//maxY
		
		return result;
		
	}

}



/**
*	getAttributeSet
*
*	all of the objects Attributes as key,value pairs.
*	This may be different from actual object data
*	as evaluations may be involved
*/
theObject.getAttributeSet=function(){
	return Modules.AttributeManager.getAttributeSet(this);
}

/**
*	updateClient
*
*	send a message to a client (identified by its socket)
*/
theObject.updateClient=function(socket,mode){
	if (!mode) mode='objectUpdate';
	var object=this;
	process.nextTick(function(){
		var SocketServer=Modules.SocketServer;
		SocketServer.sendToSocket(socket,mode, object.getAttributeSet());
	});
}

/**
*	persist
*
*	call this whenever an object has changed. It is saved
*	through the current connector, the evaluation is called
*	and a message is sent to the clients
*
*/
theObject.persist=function(){
	var data=this.get();
	if (data){
		Modules.Connector.saveObjectData(this.inRoom, this.id, data, false, this.context);
		this.updateClients();
	} 
}

/**
*	updateClients
*
*	send an upadate message to all clients which are subscribed
*	to the object's room
*/
theObject.updateClients=function(mode){
	
	if (!mode) mode='objectUpdate';
	
	var connections=Modules.UserManager.getConnectionsForRoom(this.inRoom);

	for (var i in connections){
		this.updateClient(connections[i].socket,mode);
	}
	
}

/**
*	hasContent
*
*	determines, if the object has content or not
*/
theObject.hasContent=function(){
	return this.getAttribute('hasContent');
}

/**
*	setContent
*
*	set a new content. If the content is base64 encoded png data,
*	it is decoded first.
*/
theObject.setContent=function(content,callback){
	
	if ((typeof content) != "object" && content.substr(0,22)=='data:image/png;base64,'){
		
		var base64Data = content.replace(/^data:image\/png;base64,/,""),
		content = new Buffer(base64Data, 'base64');
	}

	Modules.Connector.saveContent(this.inRoom, this.id, content, callback, this.context);
	
	this.set('hasContent',!!content);
	this.set('contentAge',new Date().getTime());

	//send object update to all listeners
	this.persist();
	this.updateClients('contentUpdate');
}
theObject.setContent.public = true;
theObject.setContent.neededRights = {
    write : true
}


theObject.copyContentFromFile=function(filename,callback) {

	Modules.Connector.copyContentFromFile(this.inRoom, this.id, filename, callback, this.context);
	
	this.set('hasContent',true);
	this.set('contentAge',new Date().getTime());

	//send object update to all listeners
	this.persist();
	this.updateClients('contentUpdate');
	
}

/**
*	getContent
*
*	get the object's content
*/
theObject.getContent=function(callback){
	if (!this.context) throw new Error('Missing context in GeneralObject.getContent');
	
	var content=Modules.Connector.getContent(this.inRoom, this.id, this.context);

    if(_.isFunction(callback)) callback(content);
    else return content;

}
theObject.getContent.public = true;
theObject.getContent.neededRights = {
    read : true
}

theObject.getContentAsString=function(callback){
	if (callback === undefined) {
		return GeneralObject.utf8.parse(this.getContent());
	} else {
		this.getContent(function(content){
			callback(GeneralObject.utf8.parse(content));
		});
	}
}


/**
*	getInlinePreview
*
*	get the object's inline preview
*/
theObject.getInlinePreview=function(callback,mimeType){
	return Modules.Connector.getInlinePreview(this.inRoom, this.id, callback, mimeType, this.context);
}

theObject.getInlinePreviewMimeType=function(callback) {
	Modules.Connector.getInlinePreviewMimeType(this.inRoom, this.id, this.context, callback);
}


theObject.evaluatePosition=function(key,value,oldvalue){

	if (this.runtimeData.evaluatePositionData===undefined) {
		this.runtimeData.evaluatePositionData={};
		this.runtimeData.evaluatePositionData.old={};
		this.runtimeData.evaluatePositionData.new={};
	}
	
	if (this.runtimeData.evaluatePositionData.delay) {
		clearTimeout(this.runtimeData.evaluatePositionData.delay);
		this.runtimeData.evaluatePositionData.delay=false;
	}
	
	this.runtimeData.evaluatePositionData['new'][key]=value;
	if (!this.runtimeData.evaluatePositionData['old'][key]) {
		this.runtimeData.evaluatePositionData['old'][key]=oldvalue;
		//if there yet is a value here, we have concurrent modifications
	}
	
	var posData=this.runtimeData.evaluatePositionData;
	var self=this;
	
	//Within this time, we collect data for evaluation. This is important
	//as often data that logically belongs together is sent seperately
	
	var timerLength=200;
	
	this.runtimeData.evaluatePositionData.delay=setTimeout(function(){
		
		var data={};
		data.old=posData.old;
		data.new=posData.new;
		
		self.evaluatePositionInt(data);
		self.runtimeData.evaluatePositionData=undefined;
	},timerLength);
	
}

theObject.evaluatePositionInt=function(data){
	
	var room=this.getRoom();
	
	if (!room) return;
	
	room.evaluatePositionFor(this,data);

}


theObject.getRoom=function(callback){
	
	//save the room differenty. This is a hack 
	
	if (!this.context) return;
	return this.context.rooms['left'];
}

theObject.getBoundingBox=function(){
	
	var x=this.getAttribute('x');
	var y=this.getAttribute('y');
	var width=this.getAttribute('width');
	var height=this.getAttribute('height');
	return {'x':x,'y':y,'width':width,'height':height};
	
}

theObject.fireEvent=function(name,data){
	
	//console.log(this+' fireing '+name+' ('+data+')');
	//console.log('###Note: Event fireing not implemented yet (GeneralObject)');

	//TODO reactive!
	Modules.EventBus.emit(name, data);
	
}