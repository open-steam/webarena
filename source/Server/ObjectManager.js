/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


// rights, functions relative to users or sockets

"use strict";

var fs=require('fs');

var Modules=false;

var ObjectManager={};

ObjectManager.isServer=true;

var enter=String.fromCharCode(10);
ObjectManager.clientCode='';


function addToClientCode(filename){
	var file=false;
	try {
		file=fs.readFileSync(filename, 'UTF8');
		ObjectManager.clientCode+=enter+enter+'//'+filename+enter+enter+file;
	} catch (e) {
		ObjectManager.clientCode+=enter+enter+'//'+filename+enter+enter+'//'+e;
	}
}

ObjectManager.toString=function(){
	return 'ObjectManager (server)';
}

var prototypes={};
var objectCache={};

ObjectManager.registerType=function(type,constr){
	prototypes[type]=constr;
}

ObjectManager.getInventory=function(roomID){
	//TODO rights check
	return this.getInventory(roomID);
}

ObjectManager.sendRoom=function(socket,roomID){
	var room=this.getRoom(roomID);
	room.updateClient(socket);
	
	var objects=this.getInventory(roomID);
	for (var i in objects){
		var object=objects[i];
		object.updateClient(socket);
		if (object.hasContent()) {object.updateClient(socket,'contentUpdate');}
	} 
}

//This function has the potential for later object caching
ObjectManager.add=function(obj){
}

ObjectManager.remove=function(obj){

	//TODO if there is a cache, remove from cache.
	
	//Send remove to connector
	
	Modules.Connector.remove(obj.inRoom,obj.id);
	
	//Inform clients about remove.
	
	obj.updateClients('objectDelete');
	
}

ObjectManager.getTypes=function(){

};

ObjectManager.getPrototype=function(objType){
	if (prototypes[objType]) return prototypes[objType];
	if (prototypes['GeneralObject']) return prototypes['GeneralObject'];
	return;
}

ObjectManager.getPrototypeFor=ObjectManager.getPrototype;

ObjectManager.buildObjectFromObjectData=function(objectData,roomID,type){
	
	//get from cache if possible
	
	if (objectCache[roomID+'#'+objectData.id]) return objectCache[roomID+'#'+objectData.id];
	
	//get the object's prototype
	
	var type=type||objectData.type;
	
	var proto=this.getPrototypeFor(type);
	
	//build a new object
	
	var obj=Object.create(proto);
	obj.init(objectData.id);
	
	//set the object's attributes and rights

	obj.data=objectData.attributes;
	obj.rights=objectData.rights;
	obj.id=objectData.id;
	obj.data.id=objectData.id;
	obj.inRoom=roomID;
	obj.data.type=type;
	
	objectCache[roomID+'#'+objectData.id]=obj;
	
	return obj;
}

ObjectManager.getObject=function(roomID,objectID){
	
	//TODO optimize this!
	
    this.getInventory(roomID); // updating the object cache
	return objectCache[roomID+'#'+objectID];
}

ObjectManager.getObjects=function(roomID){
	
	var inventory=[];
	
	//get the object creation information by the connector
	// {id;type;rights;attributes}
	
	var objectsData=Modules.Connector.getInventory(roomID);
	
	for (var i in objectsData){
		var objectData=objectsData[i];
		
		var object=this.buildObjectFromObjectData(objectData,roomID);
		inventory.push(object);
	}
	return inventory;
}

ObjectManager.getInventory=ObjectManager.getObjects;

ObjectManager.createObject=function(roomID,type, attributes, content,socket,responseID){

	if (type=='Dummy') return;

	//TODO check for rights
	
	var proto=this.getPrototypeFor(type);

	Modules.Connector.createObject(roomID,type,proto.standardData,function(id){
		var object=ObjectManager.getObject(roomID,id);
	
		object.setAttribute('name',type);
		for (var key in attributes){
			var value=attributes[key];
			object.setAttribute(key,value);
		}
		
		if (content) {
			object.setContent(content);
		}
		
		if (socket && responseID) Modules.Dispatcher.respond(socket,responseID,object.id);
		
	});
	
}

ObjectManager.init=function(theModules){
	Modules=theModules;
	
	var files=fs.readdirSync('objects');
	var objectTypes={};
	
	ObjectManager.clientCode='//Object Code for WebArena Client '+enter;
	
	files.forEach(function(filename){
		var fileinfo=filename.split('.');
		var index=fileinfo[0];
		var objName=fileinfo[1];
		if (!index) return;
		if (!objName) return;
		
		var filebase=__dirname+'/../objects/'+filename;

		var obj=require(filebase+'/server.js');
		
		addToClientCode(filebase+'/common.js');
		addToClientCode(filebase+'/client.js');
		addToClientCode(filebase+'/view.js');
		ObjectManager.clientCode+=enter+objName+'.register("'+objName+'");'+enter+enter;
		addToClientCode(filebase+'/languages.js');
		
		obj.ObjectManager=Modules.ObjectManager;
		obj.register(objName);
		
		obj.localIconPath=filebase+'/icon.png';
		
	});
	
	Modules.Dispatcher.registerCall('setAttribute',function(socket,data){
		var roomID=data.roomID
		var objectID=data.objectID;
		var key=data.key;
		var value=data.value;
		
		var object=ObjectManager.getObject(roomID,objectID);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		//TODO check write right
		
		object.setAttribute(key,value);
		
	});
	
	Modules.Dispatcher.registerCall('setContent',function(socket,data){
		var roomID=data.roomID
		var objectID=data.objectID;
		var content=data.content;
		
		var object=ObjectManager.getObject(roomID,objectID);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		//TODO check write right
		
		object.setContent(content);
		
	});
	
	Modules.Dispatcher.registerCall('getAttribute',function(socket,data){
		var roomID=data.roomID
		var objectID=data.objectID;
		var key=data.key;
		
		var object=ObjectManager.getObject(roomID,objectID);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		return object.getAttribute(key);
		
	});

	Modules.Dispatcher.registerCall('getContent',function(socket,data){
		var roomID=data.roomID
		var objectID=data.objectID;
			
		var object=ObjectManager.getObject(roomID,objectID);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		return object.getContent();
		
	});
	
	Modules.Dispatcher.registerCall('deleteObject',function(socket,data){
		//TODO check delete right
		var roomID=data.roomID
		var objectID=data.objectID;
		
		var object=ObjectManager.getObject(roomID,objectID);
				if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		object.remove();
		
	});
	
	Modules.Dispatcher.registerCall('createObject',function(socket,data,responseID){
		
		//TODO check create right
		var roomID=data.roomID;
		var type=data.type;
		var attributes=data.attributes;
		var content=data.content;
		
		//Provide response id to inform the client of the newly created object
		
		//TODO: check why all clients get notified about object creation (spooky =) )
		Modules.ObjectManager.createObject(roomID,type,attributes,content,socket,responseID);
		
	});
	
	Modules.Dispatcher.registerCall('duplicate',function(socket,data,responseID){
		var roomID=data.roomID
		var objectID=data.objectID;
		
		var object=ObjectManager.getObject(roomID,objectID);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		object.duplicate(socket,responseID);
		
	});
	
	//TODO: find a better place for this...
	Modules.Dispatcher.registerCall('getPreviewableMimeTypes',function(socket,data,responseID){

		Modules.Dispatcher.respond(socket,responseID,Modules.Connector.getInlinePreviewMimeTypes());
		
	});
		
}

ObjectManager.getRoom=function(roomID){
	
	var objectData=Modules.Connector.getRoomData(roomID);
	
	var object=this.buildObjectFromObjectData(objectData,roomID,'Room');
	
	return object;
	
}

ObjectManager.getClientCode=function(){
	
	var code='"use strict";';
	
	var lines=this.clientCode.split(enter);
	
	for (var i=0;i<lines.length;i++){
		var line=lines[i];
		code+=line+' //'+(i+1)+enter;
	}
	
	return code;
}

module.exports=ObjectManager;