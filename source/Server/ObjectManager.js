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
var prototypes={};

ObjectManager.isServer=true;

var enter=String.fromCharCode(10);

ObjectManager.toString=function(){return 'ObjectManager (server)';}

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
					object.updateClient(socket,'contentUpdate',object.hasContent(socket));
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
	
	if (!objectData){
		Modules.Log.error('No object data!');
	}
	
	var type=type||objectData.type;
	
	//get the object's prototype

	var proto=ObjectManager.getPrototypeFor(type);
	
	//build a new object
	
	var obj=Object.create(proto);
	obj.init(objectData.id);
	
	//set the object's attributes and rights

	obj.setAll(objectData.attributes);
	obj.rights=objectData.rights;
	obj.id=objectData.id;
	obj.attributeManager.set(objectData.id,'id',objectData.id);
	obj.inRoom=roomID;
	obj.set('type',type);
	
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
	
	if (!objectData) return false;

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
*	This function can either be called synchronous or asyncronous.
*
*/
ObjectManager.getObjects=function(roomID,context,callback){

	if (!context) throw new Error('Missing context in ObjectManager.getObjects');
	
	var inventory=[];
	
	//get the object creation information by the connector
	// {id;type;rights;attributes}
	
	if (callback == undefined) {
		/* sync. */
		
		var objectsData = Modules.Connector.getInventory(roomID, context);
		
		for (var i in objectsData){
			var objectData=objectsData[i];

			var object=buildObjectFromObjectData(objectData,roomID);

			object.context=context;

			inventory.push(object);
		}

		return inventory;
		
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

	//TODO send error to client if there is a rights issue here
		
	var proto=this.getPrototypeFor(type);

	Modules.Connector.createObject(roomID,type,proto.standardData,function(id){
		var object=ObjectManager.getObject(roomID,id,context);

		//set default attributes
		var defaultAttributes = object.standardData;
		for (var key in defaultAttributes){
			var value=defaultAttributes[key];			
			object.setAttribute(key,value);
		}

		object.setAttribute('name',type);
		
		for (var key in attributes){
			var value=attributes[key];
			object.setAttribute(key,value);
		}
		
		if (content) {
			object.setContent(content);
		}

		if (socket && responseID) {
			Modules.Dispatcher.respond(socket,responseID,object.id);
		}
		
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
	
	files.sort();
	
	ObjectManager.clientCode='//Object Code for WebArena Client '+enter;
	
	var whiteList={};
	var blackList={};
	var hasWhiteList=false;
	
	for (var i in Modules.config.objectWhitelist){
		hasWhiteList=true;
		whiteList[Modules.config.objectWhitelist[i]]=true;
	}
	
	for (var i in Modules.config.objectBlacklist){
		blackList[Modules.config.objectBlacklist[i]]=true;
	}
	
	if (hasWhiteList){
		whiteList.GeneralObject=true;
		whiteList.Room=true;
		whiteList.IconObject=true;
		whiteList.UnknownObject=true;
		whiteList.ImageObject=true;
	}
	
	files.forEach(function(filename){
		
		try {
		
			var fileinfo=filename.split('.');
			var index=fileinfo[0];
			var objName=fileinfo[1];
			if (!index) return;
			if (!objName) return;
			
			if (hasWhiteList && !whiteList[objName]) {
				console.log('Type '+objName+' not whitelisted.');
				return;
			}
			
			if (blackList[objName]){
				console.log('Type '+objName+' is blacklisted.');
				return;
			}
			
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
			
		} catch (e) {
			Modules.Log.warn('Could not register '+objName);
			Modules.Log.warn(e);
		}
		
	});
	
	//This is the interface for clients. Registering functions for attribute access and
	//other object updates
	
	
	//setAttribute
	Modules.Dispatcher.registerCall('setAttribute',function(socket,data,responseID){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		var key=data.key;
		var value=data.value;
		

		Modules.Connector.mayWrite(roomID, objectID, context, function(mayWrite) {
		
			if (mayWrite) {
				
				var object=ObjectManager.getObject(roomID,objectID,context);
				if (!object){
					//Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
					return;
				}
		

				object.setAttribute(key,value,false,context);
				
			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to set attribute '+objectID);
			}
			
		});
		
	});
	
	//setContent
	Modules.Dispatcher.registerCall('setContent',function(socket,data,responseID){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		var content=data.content;
		
		Modules.Connector.mayWrite(roomID, objectID, context, function(mayWrite) {
		
			if (mayWrite) {
				
				var object=ObjectManager.getObject(roomID,objectID,context);
				if (!object){
					Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
					return;
				}

				object.setContent(content);
				
			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to set content '+objectID);
			}
			
		});
		
	});
	
	//getAttribute
	Modules.Dispatcher.registerCall('getAttribute',function(socket,data,responseID){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		var key=data.key;
		
		Modules.Connector.mayRead(roomID, objectID, context, function(mayRead) {
		
			if (mayRead) {
				
				var object=ObjectManager.getObject(roomID,objectID,context);
				if (!object){
					Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
					return;
				}

				Modules.Dispatcher.respond(socket,responseID,object.getAttribute(key));
				
			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to get attribute '+objectID);
			}
			
		});
		
	});

	//getContent
	Modules.Dispatcher.registerCall('getContent',function(socket,data,responseID){

		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		
		Modules.Connector.mayRead(roomID, objectID, context, function(mayRead) {

			if (mayRead) {

				var object=ObjectManager.getObject(roomID,objectID,context);
				if (!object){
					Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
					return;
				}

				Modules.Dispatcher.respond(socket,responseID,object.getContent(context));
				
			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to get attribute '+objectID);
			}
			
		});
		
	});
	
	//deleteObject
	Modules.Dispatcher.registerCall('deleteObject',function(socket,data,responseID){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);

		var roomID=data.roomID
		var objectID=data.objectID;

		Modules.Connector.mayDelete(roomID, objectID, context, function(mayDelete) {
		
			if (mayDelete) {
				
				var object=ObjectManager.getObject(roomID,objectID,context);
				if (!object){
					Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
					return;
				}

				object.remove();
				
			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to get attribute '+objectID);
			}
			
		});
		
	});
	
	//createObject
	Modules.Dispatcher.registerCall('createObject',function(socket,data,responseID){

		var context=Modules.UserManager.getConnectionBySocket(socket);

		var roomID=data.roomID;
		var type=data.type;
		var attributes=data.attributes;
		var content=data.content;
		
		//Provide response id to inform the client of the newly created object
		
		//TODO: check why all clients get notified about object creation (spooky =) )
		
		Modules.Connector.mayInsert(roomID, context, function(mayInsert) {
		
			if (mayInsert) {
				
				Modules.ObjectManager.createObject(roomID,type,attributes,content,socket,responseID);
				
			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to get attribute '+objectID);
			}
			
		});
		
	});
	
	//duplicate
	Modules.Dispatcher.registerCall('duplicate',function(socket,data,responseID){
		
		var context=Modules.UserManager.getConnectionBySocket(socket);
		
		var roomID=data.roomID
		var objectID=data.objectID;
		
		var object=ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
		}
		
		Modules.Connector.mayRead(roomID, objectID, context, function(mayRead) {
		
			if (mayRead) {
				
				Modules.Connector.mayInsert(roomID, context, function(mayInsert) {

					if (mayInsert) {

						object.duplicate(socket,responseID);

					} else {
						Modules.SocketServer.sendToSocket(socket,'error','No rights to get attribute '+objectID);
					}

				});
				
			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
			}
			
		});
		
	});
	
	//TODO: find a better place for this...
	Modules.Dispatcher.registerCall('getPreviewableMimeTypes',function(socket,data,responseID){

		Modules.Dispatcher.respond(socket,responseID,Modules.Connector.getInlinePreviewMimeTypes());

	});

    Modules.Dispatcher.registerCall('customObjectFunctionCall', function(socket, data, responseID){
        var context=Modules.UserManager.getConnectionBySocket(socket);
        var roomID=data.roomID
        var objectID=data.objectID;

        var server_function         = data.customFunctionCall.name;
        var server_function_params  = data.customFunctionCall.params;

        var responseCallback = function(res){
            Modules.Dispatcher.respond(socket,responseID,res);
        };

        var object=ObjectManager.getObject(roomID,objectID,context);

        server_function_params['callback'] = responseCallback;

        var fn = object[server_function];
        
        if (!fn.public) return false;
        
        //fn(server_function_params);
        fn.call(object, server_function_params)
    });

    Modules.Dispatcher.registerCall('search',function(socket,data,responseID){
        var context=Modules.UserManager.getConnectionBySocket(socket);
        var roomID=data.roomID
        var objectID=data.objectID;


        var searchArgs = {
            searchParams : data.searchParams,
            offset : data.offset || 0,
            limit : data.limit || 10
        };

        var searchCallback = function(res){
            console.log('Send search results to client.');
            Modules.Dispatcher.respond(socket,responseID,res);
        }
        searchArgs['callback'] = searchCallback;

        var object=ObjectManager.getObject(roomID,objectID,context);
        if (!object){
            return Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
        }

        object.search(searchArgs);

    });

    Modules.Dispatcher.registerCall('browse', function(socket, data, responseID){
    	var context=Modules.UserManager.getConnectionBySocket(socket);
        var roomID=data.roomID
        var objectID=data.objectID;
    	var browseLocation = data.browseLocation || null;
	
	    var object=ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
		}


		Modules.Connector.mayRead(roomID, objectID, context, function(mayRead) {

			if (mayRead) {

				var object=ObjectManager.getObject(roomID,objectID,context);
				if (!object){
					Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
					return;
				}

				var responseCallback = function(res){
		            console.log('Send browse results to client.');
		            Modules.Dispatcher.respond(socket,responseID,res);
		        };

			    var browseParams = {
			        //location : browseLocation,
			        callback : responseCallback
			    };

		        object.browse(browseParams);

			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
			}

		});
		
    });
	    
	
	Modules.Dispatcher.registerCall('memoryUsage',function(socket,data,responseID){
		
		var util=require('util');
		
		var result={};
		
		result.memory=util.inspect(process.memoryUsage());
		
		console.log(result);
		
		Modules.Dispatcher.respond(socket,responseID,result);
		
	});
	
	//Information are sent to all clients in the same room
	Modules.Dispatcher.registerCall('inform',function(socket,data,responseID){
		
		var connections=Modules.UserManager.getConnectionsForRoom(data.room);
		
		for (var i in connections){
			var socket=connections[i].socket;
			Modules.SocketServer.sendToSocket(socket,'inform',data);
		}
		
		if (data.message.text !== undefined) {
			/* chat message */

			var context=Modules.UserManager.getConnectionBySocket(socket);
			ObjectManager.getRoom(data.room,context,function(room) {
				
				var oldMessages = room.get('chatMessages');
				if (oldMessages === undefined) oldMessages = [];
				oldMessages.push(data);
				
				oldMessages = oldMessages.slice(-20); //only save the last 20 messages
				room.set('chatMessages', oldMessages); room.persist();
				
			});			
		}

	});
	
	Modules.Dispatcher.registerCall('bugreport',function(socket,data,responseID){

		if (Modules.config.bugreport === undefined) {
			console.log("Bug report settings missing!");
			return;
		}

		var email   = require("emailjs/email");
		var server  = email.server.connect({
		   user:    Modules.config.bugreport.server.user,
		   password: Modules.config.bugreport.server.password,
		   host:    Modules.config.bugreport.server.host,
		   ssl:     Modules.config.bugreport.server.ssl,
		   port: 	Modules.config.bugreport.server.port,
		});
		
		
		var date = new Date();
		
		var text = "Datum: "+date.getDate()+"."+(date.getMonth() + 1)+"."+date.getFullYear()+", "+date.getHours()+":"+date.getMinutes()+" Uhr"+"\n";
		text += "UserAgent: "+data.userAgent+"\n";
		text += "Benutzer: "+data.user+"\n\n";
		
		text += "Was wollten Sie tun?\n----------------------------------\n";
		text += data.task+"\n\n\n";
		
		text += "Welches Problem ist aufgetreten?\n----------------------------------\n";
		text += data.problem+"\n\n\n";
		
		text += "Objekte im Raum:\n----------------------------------\n";
		text += data.objects
		
		if (Modules.config.bugreport.recipients !== undefined) {
			
			var counter = 0;
			
			for (var i in Modules.config.bugreport.recipients) {
				var emailAddress = Modules.config.bugreport.recipients[i];
				
				server.send({
				   text:    text, 
				   from:    Modules.config.bugreport.server.from, 
				   to:      emailAddress,
				   subject: Modules.config.bugreport.server.subject
				}, function(err, message) { 

					if (counter == 0) {

						if (err === null) {
							Modules.Dispatcher.respond(socket,responseID,true); //ok
						} else {
							Modules.Dispatcher.respond(socket,responseID,false); //error sending mail
						}
						
					}
					
					counter++;

				});
				
			}
			
		} else {
			console.log("no recipients for bug report");
		}

	});
		
}

/**
*	getRoom
*
*	returns the a room object for a given roomID
**/
ObjectManager.getRoom=function(roomID,context,callback,oldRoomId){
	
	if (!context) throw new Error('Missing context in ObjectManager.getRoom');
	
	Modules.Connector.getRoomData(roomID,context, function(data) {
		var obj=buildObjectFromObjectData(data,roomID,'Room');
		obj.context=context;
		callback(obj);
	},oldRoomId);
	
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

    var showDebugLineNumbers = !!Modules.config.showDebugLineNumbers;
	//fill in line numbers for debugging
	for (var i=0;i<lines.length;i++){
		var line=lines[i];
        code+=line

        if(showDebugLineNumbers) code += ' //'+(i+1)

        code += enter
	}
	
	return code;
}

ObjectManager.sendChatMessages=function(roomID,socket) {
	
	var context=Modules.UserManager.getConnectionBySocket(socket);
	ObjectManager.getRoom(roomID,context,function(room) {
		
		var oldMessages = room.get('chatMessages');
		if (oldMessages === undefined) oldMessages = [];
		
		for (var i in oldMessages) {
			var data=oldMessages[i];
			data.message.read=true;
			Modules.SocketServer.sendToSocket(socket,'inform',data);
		}
		
	});
	
}

module.exports=ObjectManager;
