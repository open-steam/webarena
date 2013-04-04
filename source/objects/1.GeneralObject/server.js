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
theObject.getInlinePreview=function(callback,mimeType){
	return Modules.Connector.getInlinePreview(this.inRoom, this.id, callback, mimeType, this.context);
}

theObject.getInlinePreviewMimeType=function(callback) {
	Modules.Connector.getInlinePreviewMimeType(this.inRoom, this.id, this.context, callback);
}


theObject.duplicate=function(socket,responseID) {

	var self = this;

	var roomId = this.inRoom;
	
	
	var list = this.getObjectsToDuplicate();
	
	var counter = 0;
	var idTranslationList = {}; //list of object ids and their duplicated new ids
	var newObjects = []; //list of new (duplicated) objects
	
	/* this function will be called by the last duplicate-callback */
	var updateObjects = function() {
		counter++;
		
		if (counter == list.length) {
			/* all objects are duplicated */

			var idList = [];
			
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
				
				if (object.hasContent()) {
					object.updateClient(socket,'contentUpdate',object.hasContent(socket));
				}
				
				idList.push(object.id);
				
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
	if (!this.context) return;
	return this.context.room;
}

theObject.getBoundingBox=function(){
	
	var x=this.getAttribute('x');
	var y=this.getAttribute('y');
	var width=this.getAttribute('width');
	var height=this.getAttribute('height');
	return {'x':x,'y':y,'width':width,'height':height};
	
}

theObject.onSwitchContext=function(context){
	
	if (Modules.Config.noContext) return;
	
	if (!this.getAttribute('position_on_all_contexts')){
		this.setAttribute('x',this.getAttribute('x_'+context)||this.getAttribute('x_general')||this.getAttribute('x'));
		this.setAttribute('y',this.getAttribute('y_'+context)||this.getAttribute('y_general')||this.getAttribute('y'));
	}
	
	if (!this.getAttribute('appearance_on_all_contexts')){
		this.setAttribute('width',this.getAttribute('width_'+context)||this.getAttribute('width_general')||this.getAttribute('width'));
		this.setAttribute('height',this.getAttribute('height_'+context)||this.getAttribute('height_general')||this.getAttribute('height'));
	}
	
	var contexts=this.whichContexts();
	if (contexts!==true){
		var visible=false;
		for (var i in contexts){
			var comp=contexts[i];
			if (comp==context) visible=true;
		}
		this.setAttribute('visible',visible);
	}
	
}