/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

// no users, no rights, no server communication

"use strict";

var fs=require('fs');

var Modules=false;
var ServerCore={};

var enter=String.fromCharCode(10);
ServerCore.clientCode='';

ServerCore.init=function(theModules){
	
	Modules=theModules;
	
	var files=fs.readdirSync('objects');
	var objectTypes={};
	
	ServerCore.clientCode='//Object Code for WebArena Client '+enter;
	
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
		ServerCore.clientCode+=enter+objName+'.register("'+objName+'");'+enter+enter;
		addToClientCode(filebase+'/languages.js');
		
		obj.ObjectManager=Modules.ObjectManager;
		obj.register(objName);
		
		obj.localIconPath=filebase+'/icon.png';
		
	});

}

function addToClientCode(filename){
	var file=false;
	try {
		file=fs.readFileSync(filename, 'UTF8');
		ServerCore.clientCode+=enter+enter+'//'+filename+enter+enter+file;
	} catch (e) {
		ServerCore.clientCode+=enter+enter+'//'+filename+enter+enter+'//'+e;
	}
}

var prototypes={};
var objectCache={};

ServerCore.registerType=function(type,constr){
	prototypes[type]=constr;
}

ServerCore.getPrototypeFor=function(objType){
	if (prototypes[objType]) return prototypes[objType];
	if (prototypes['GeneralObject']) return prototypes['GeneralObject'];
	return;
}

ServerCore.buildObjectFromObjectData=function(objectData,roomID,type){
	
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

ServerCore.getObject=function(roomID,objectID){
	
	//TODO optimize this!
	
    this.getInventory(roomID); // updating the object cache
	return objectCache[roomID+'#'+objectID];
}

ServerCore.getInventory=function(roomID){
	
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

ServerCore.getRoom=function(roomID){
	
	var objectData=Modules.Connector.getRoomData(roomID);
	
	var object=this.buildObjectFromObjectData(objectData,roomID,'Room');
	
	return object;
	
}

ServerCore.getClientCode=function(){
	
	var code='"use strict";';
	
	var lines=this.clientCode.split(enter);
	
	for (var i=0;i<lines.length;i++){
		var line=lines[i];
		code+=line+' //'+(i+1)+enter;
	}
	
	return code;
}

ServerCore.createObject=function(roomID,type,after){
	var proto=this.getPrototypeFor(type);

	Modules.Connector.createObject(roomID,type,proto.standardData,after);
}

ServerCore.remove=function(obj){

	//TODO if there is a cache, remove from cache.
	
	//Send remove to connector
	
	Modules.Connector.remove(obj.inRoom,obj.id);
	
	//Inform clients about remove.
	
	obj.updateClients('objectDelete');
	
}

module.exports=ServerCore;
