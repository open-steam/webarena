/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject server component
*
*/

// The server side defintion of the object extends the common parts

var theObject=Object.create(require('./common.js'));

// The Modules variable provides access to server modules such as
// Module.ObjectManager or Module.ServerCore

var Modules=require('../../server.js');

// Make the object public
module.exports=theObject;

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
		SocketServer.sendToSocket(socket,mode, object.data);
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
	Modules.Connector.saveObjectData(this.inRoom, this.id, this.data);
	if (this.evaluate) this.evaluate();
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

	Modules.Connector.saveContent(this.inRoom, this.id, content, callback);
	
	this.data.hasContent=!!content;
	this.data.contentAge=new Date().getTime();

	//send object update to all listeners
	this.persist();
	this.updateClients('contentUpdate');
}

theObject.copyContentFromFile=function(filename,callback) {

	Modules.Connector.copyContentFromFile(this.inRoom, this.id, filename, callback);
	
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
	var content=Modules.Connector.getContent(this.inRoom, this.id);
	return content;
}


/**
*	getInlinePreview
*
*	get the object's inline preview
*/
theObject.getInlinePreview=function(callback,mimeType){
	return Modules.Connector.getInlinePreview(this.inRoom, this.id, callback, mimeType);
}

theObject.getInlinePreviewMimeType=function() {
	return Modules.Connector.getInlinePreviewMimeType(this.inRoom, this.id);
}


theObject.duplicate=function(socket,responseID) {

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
			var obj = Modules.ObjectManager.getObject(roomId, newId);
			
			newObjects.push(obj);
			idTranslationList[oldId] = newId;

			updateObjects(); //try to update objects

		});
		
	}
	
	
}