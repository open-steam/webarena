/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


"use strict";

var fs=require('fs');

var Modules=false;
var ObjectManager={};
var runtimeData={};
ObjectManager.isServer=true;


var enter=String.fromCharCode(10);


ObjectManager.toString=function(){return 'ObjectManager (server)';}

var prototypes={};

/**
*	registerType
*
*	registers an object type, so objects can be created by this objectManager
*/
ObjectManager.registerType=function(type,constr){
	prototypes[type]=constr;
}

/**
*	sendRoom
*
*	sends a rooms content to a client (given by its socket)
*
*/
ObjectManager.sendRoom=function(socket,roomID){
	
	var context=Modules.UserManager.getConnectionBySocket(socket);
	
	Modules.ObjectManager.getRoom(roomID,context,function(room) { //the room object

		room.updateClient(socket);				//and send it to the client
		
		Modules.ObjectManager.getInventory(roomID,context,function(objects) {

			for (var i in objects){
				var object=objects[i];
				object.updateClient(socket);	//the object data
				if (object.hasContent()) {		//and its content if there is some
					object.updateClient(socket,'contentUpdate');
				}
			}

		});
		
	});	
 
}

/**
*	remove
*
*	deletes an object and informs clients about the deletion
*/
ObjectManager.remove=function(obj){
	
	//Send remove to connector
	
	Modules.Connector.remove(obj.inRoom,obj.id,obj.context);
	
	//Inform clients about remove.
	
	obj.updateClients('objectDelete');
	
}

/**
*	getPrototype / getPrototypeFor
*
*	gets the prototype (the class) of an object.
*/
ObjectManager.getPrototype=function(objType){
	if (prototypes[objType]) return prototypes[objType];
	if (prototypes['GeneralObject']) return prototypes['GeneralObject'];
	return;
}

ObjectManager.getPrototypeFor=ObjectManager.getPrototype;


/**
*	buildObjectFromObjectData
*
*	creates an object from given objectData. This objectData are the
*	attributes saved on the persistance layer.
*
*	Attention. This is called on EVERY call of getObject so object you
*	get by getObject is a different one on every call. The consequence
*	of this is, that you cannot add properties to the object! If you
*	want to save runtime data, use the runtimeData property.
*	
*/
function buildObjectFromObjectData(objectData,roomID,type){
	
	var type=type||objectData.type;
	
	//get the object's prototype
	
	var proto=ObjectManager.getPrototypeFor(type);
	
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
	
	if (!runtimeData[obj.id])runtimeData[obj.id]={}; //create runtime data for this object if there is none
	
	obj.runtimeData=runtimeData[obj.id];
	
	return obj;
}

/**
*	getObject
*
*	gets an Object by a given id and its context (context is user credentials)
*
*	Attention. EVERY call of getObject returns a different object on every call. 
*   The consequence of this is, that you cannot add properties to the object! 
*   If you want to save runtime data, use the runtimeData property.
*/
ObjectManager.getObject=function(roomID,objectID,context){

	if (!context) throw new Error('Missing context in ObjectManager.getObject');
	
	var objectData=Modules.Connector.getObjectData(roomID,objectID,context);

	var object=buildObjectFromObjectData(objectData,roomID);
	
	object.context=context;
	
	return object;
	
}

/**
*	getObjects / getInventory
*
*	gets an inventory of all objects in a room by roomID and context. Context
*	is user credentials.
*
*	This function can either be called synchronous or asyncronous. Please not
*	that syncronous usage only works when objects have yet been cached!
*
*/
ObjectManager.getObjects=function(roomID,context,callback){

	if (!context) throw new Error('Missing context in ObjectManager.getObjects');
	
	var inventory=[];
	
	//get the object creation information by the connector
	// {id;type;rights;attributes}
	
	if (callback == undefined) {
		/* sync. */
		
		/* check if inventory is cached */
		if (Modules.Connector.inventoryIsCached(roomID,context)) {
		
			var objectsData = Modules.Connector.getCachedInventory(roomID, context);
			
			for (var i in objectsData){
				var objectData=objectsData[i];

				var object=buildObjectFromObjectData(objectData,roomID);

				object.context=context;

				inventory.push(object);
			}
			
			return inventory;
		
		} else throw Error("inventory is not cached for room "+roomID);
		
	} else {
		//async.

		Modules.Connector.getInventory(roomID,context,function(objectsData) {

			for (var i in objectsData){
				var objectData=objectsData[i];

				var object=buildObjectFromObjectData(objectData,roomID);

				object.context=context;

				inventory.push(object);
			}

			callback(inventory); 

		});
		
	}

}

ObjectManager.getInventory=ObjectManager.getObjects;

/**
*	createObject
*
*	creates a new object
*
**/
ObjectManager.createObject=function(roomID,type, attributes, content,socket,responseID){
	
	var context=Modules.UserManager.getConnectionBySocket(socket);

	if (type=='Dummy') return;

	//TODO send error to client if there is a rights issue here
		
	var proto=this.getPrototypeFor(type);

	Modules.Connector.createObject(roomID,type,proto.standardData,function(id){
		var object=ObjectManager.getObject(roomID,id,context);
	
		object.setAttribute('name',type);
		for (var key in attributes){
			var value=attributes[key];
			object.setAttribute(key,value);
		}
		
		if (content) {
			object.setContent(content);
		}
		
		if (socket && responseID) Modules.Dispatcher.respond(socket,responseID,object.id);
		
	},context);
	
}

/**
*	addToClientCode (internal)
**/
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

/**
*	init
*
*	initializes the ObjectManager
**/
ObjectManager.init=function(theModules){
	Modules=theModules;
	
	//go through all objects, build its client code (the code for the client side)
	//register the object types.
	
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
	
	//This is the interface for clients. Registering functions for attribute access and
	//other object updates
	
	
	//setAttribute
	Modules.Dispatcher.registerCall('setAttribute',function(socket,data){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		var key=data.key;
		var value=data.value;

		var object=ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		//TODO check write right
		
		object.setAttribute(key,value,false,context);
		
	});
	
	//setContent
	Modules.Dispatcher.registerCall('setContent',function(socket,data){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		var content=data.content;
		
		var object=ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		//TODO check write right
		
		object.setContent(content,false,context);
		
	});
	
	//getAttribute
	Modules.Dispatcher.registerCall('getAttribute',function(socket,data){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		var key=data.key;
		
		var object=ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		return object.getAttribute(key);
		
	});

	//getContent
	Modules.Dispatcher.registerCall('getContent',function(socket,data){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
			
		var object=ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		return object.getContent(context);
		
	});
	
	//deleteObject
	Modules.Dispatcher.registerCall('deleteObject',function(socket,data){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		//TODO check delete right
		var roomID=data.roomID
		var objectID=data.objectID;
		
		var object=ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
		}
		
		object.remove();
		
	});
	
	//createObject
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
	
	//duplicate
	Modules.Dispatcher.registerCall('duplicate',function(socket,data,responseID){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		
		var object=ObjectManager.getObject(roomID,objectID,context);
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

/**
*	getRoom
*
*	returns the a room object for a given roomID
**/
ObjectManager.getRoom=function(roomID,context,callback){
	
	if (!context) throw new Error('Missing context in ObjectManager.getRoom');
	
	Modules.Connector.getRoomData(roomID,context, function(data) {
		callback(buildObjectFromObjectData(data,roomID,'Room'));
	});
	
}

/**
*	getClientCode
*
*	get the combined client side sourcecode for objects.
**/
ObjectManager.getClientCode=function(){
	
	//turn on strict mode for client side scripting
	var code='"use strict";';
	
	var lines=this.clientCode.split(enter);
	
	//fill in line numbers for debugging
	for (var i=0;i<lines.length;i++){
		var line=lines[i];
		code+=line+' //'+(i+1)+enter;
	}
	
	return code;
}

module.exports=ObjectManager;