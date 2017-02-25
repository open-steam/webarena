/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var UserGetter=Object.create(require('./Application.js'));
var objectList={};
var Modules={};

UserGetter.clientAppData = {
					hasGui: true, guiElements: {
					buttonName: "test", 
					icon: "arrow-left", 
					clickFunction:"warn"}
					};


UserGetter.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

UserGetter.startUserGetter=function(object){
	objectList[object.getAttribute('id')]=object;
	updateAttributes(object);
}

UserGetter.onEntered=function(){
	updateAttributes();
}

//TODO: startUserGetter never ends if the user that created it leaves
UserGetter.onLeft=function(){
	updateAttributes();
}

function updateAttributes(object){
	if (object){
		
		var userDataRaw=Modules.UserManager.getUserLocations();
		
		var userData=[];
		for (var i in userDataRaw){
			var element={};
			element.name=userDataRaw[i].username;
			element.id=userDataRaw[i].id;
			element.room=userDataRaw[i].room.id;
			
			userData.push(element);
		}
		
		object.setAttribute('userData',userData);
		
		return;
	}
	
	for (var i in objectList){
		process.nextTick(function(){
			updateAttributes(objectList[i]);
		});
	}
	
}

UserGetter.getClientAppData = function(object, data, callback){
	return this.clientAppData;
}


module.exports=UserGetter;