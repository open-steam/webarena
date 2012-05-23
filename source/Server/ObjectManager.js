/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


// rights, functions relative to users or sockets

var Modules=false;

var ObjectManager={};

ObjectManager.isServer=true;

ObjectManager.toString=function(){
	return 'ObjectManager (server)';
}

ObjectManager.registerType=function(type,constr){
	Modules.ServerCore.registerType(type,constr);
};

ObjectManager.getInventory=function(roomID){
	//TODO rights check
	return Modules.ServerCore.getInventory(roomID);
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
	//TODO check rights
	return Modules.ServerCore.remove(obj);
}

ObjectManager.getTypes=function(){

};

ObjectManager.getPrototype=function(type){
	return Modules.ServerCore.getPrototypeFor(type);
}

ObjectManager.getObject=function(roomID,objectID){
	//TODO check rights
	return Modules.ServerCore.getObject(roomID,objectID);
}

ObjectManager.getObjects=function(roomID) {
	return Modules.ServerCore.getInventory(roomID);
}

ObjectManager.createObject=function(roomID,type, attributes, content,socket,responseID){

	if (type=='Dummy') return;

	//TODO check for rights
	
	Modules.ServerCore.createObject(roomID,type,function(id){
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

ObjectManager.getClientCode=function(){
	return Modules.ServerCore.getClientCode();
}

ObjectManager.getRoom=function(roomID){
	//TODO rights check
	return Modules.ServerCore.getRoom(roomID);
}

module.exports=ObjectManager;