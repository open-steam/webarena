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

// Make the object public
module.exports=theObject;

/**
*	getAttributeSet
*
*	all of the objects Attributes as key,value pairs.
*	This may be different from actual object.data
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
	
	Modules.Connector.saveObjectData(this.inRoom, this.id, this.data, false, this.context);
	this.updateClients();
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
	
	if (content.substr(0,22)=='data:image/png;base64,'){
		
		var base64Data = content.replace(/^data:image\/png;base64,/,""),
		content = new Buffer(base64Data, 'base64');
	}

	Modules.Connector.saveContent(this.inRoom, this.id, content, callback, this.context);
	
	this.data.hasContent=!!content;
	this.data.contentAge=new Date().getTime();

	//send object update to all listeners
	this.persist();
	this.updateClients('contentUpdate');
}

theObject.copyContentFromFile=function(filename,callback) {

	Modules.Connector.copyContentFromFile(this.inRoom, this.id, filename, callback, this.context);
	
	this.data.hasContent=true;
	this.data.contentAge=new Date().getTime();

	//send object update to all listeners
	this.persist();
	this.updateClients('contentUpdate');
	
}

/**
*	getContent
*
*	get the object's content
*/
theObject.getContent=function(){
	
	if (!this.context) throw new Error('Missing context in GeneralObject.getContent');
	
	var content=Modules.Connector.getContent(this.inRoom, this.id, this.context);
	return content;
}


/**
*	getInlinePreview
*
*	get the object's inline preview
*/
theObject.getInlinePreview=function(webserverResponse,mimeType){
	return Modules.Connector.getInlinePreview(this.inRoom, this.id, webserverResponse, mimeType,this.context);
}

theObject.getInlinePreviewMimeType=function(callback) {
	Modules.Connector.getInlinePreviewMimeType(this.inRoom, this.id, this.context, callback);
}


theObject.duplicate=function(socket,responseID) {

	var self = this;

	var roomId = this.inRoom;
	
	
	var list = this.getObjectsToDuplicate();
	
	console.log("LIST", list);

	var counter = 0;
	var idTranslationList = {}; //list of object ids and their duplicated new ids
	var newObjects = []; //list of new (duplicated) objects
	
	/* this function will be called by the last duplicate-callback */
	var updateObjects = function() {
		counter++;
		
		if (counter == list.length) {
			/* all objects are duplicated */

			var idList = [];
			
			console.log("new objects:", newObjects);

			for (var i in newObjects) {
				var object = newObjects[i];

				object.updateLinkIds(idTranslationList); //update links

				object.setAttribute("x", object.getAttribute("x")+30);
				object.setAttribute("y", object.getAttribute("y")+30);

				/* add group id if source object was grouped */
				if (object.getAttribute("group") && object.getAttribute("group") > 0) {
					object.setAttribute("group", object.getAttribute("group")+1);
				}

				object.updateClients();
				
				idList.push(object.data.id);
				
			}
			
			if (socket && responseID) {
				Modules.Dispatcher.respond(socket,responseID,idList);
			}
			
		}
	}
	
	for (var i in list) {
		var objectId = list[i];
		
		Modules.Connector.duplicateObject(roomId,objectId,function(newId,oldId) {
			var obj = Modules.ObjectManager.getObject(roomId, newId, self.context);

			console.log("add to new list:", obj.data.id, "-", newId, oldId, obj);

			newObjects.push(obj);
			idTranslationList[oldId] = newId;

			updateObjects(); //try to update objects

		},self.context);
		
	}
	
	
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
	this.runtimeData.evaluatePositionData['old'][key]=oldvalue;
	
	var posData=this.runtimeData.evaluatePositionData;
	var self=this;
	
	this.runtimeData.evaluatePositionData.delay=setTimeout(function(){
		
		var data={};
		data.old=posData.old;
		data.new=posData.new;
		
		self.evaluatePositionInt(data);
		self.runtimeData.evaluatePositionData=undefined;
	},300);
	
}

theObject.evaluatePositionInt=function(data){
	
	var room=this.getRoom();
	
	if (!room) return;
	
	room.evaluatePositionFor(this,data);
	
	//if this is an evaluationobject
	//recalculate positions of nonevaluation objects
}

theObject.getPosition=function(){
	
	var room=this.getRoom();
	
	if (room){
		return this.getRoom().getEvaluatedPositionFor(this);
	} else {
		var data={};
		data.x=this.getAttribute('x',true);
		data.y=this.getAttribute('y',true);
		data.width=this.getAttribute('width',true);
		data.height=this.getAttribute('height',true);
		return data;
	}
}

theObject.getRoom=function(callback){
	if (!this.context) return;
	return this.context.rooms[this.inRoom]; //the room has been set into context on subscrube (in UserManager)
}