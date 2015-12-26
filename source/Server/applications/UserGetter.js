/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var UserGetter=require('./Application.js');
var objectList={};
var Modules={};

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

UserGetter.onLeft=function(){
	updateAttributes();
}

function updateAttributes(object){
	if (object){
		
		var userData=Modules.UserManager.getUserLocations();
		
		var userNames=[];
		
		for (var i in userData){
			userNames.push(userData[i].username);
		}
		
		console.log(userNames);
		
		object.setAttribute('userNames',userNames);
		
		return;
	}
	
	for (var i in objectList){
		process.nextTick(function(){
			updateAttributes(objectList[i]);
		});
	}
	
}

module.exports=UserGetter;