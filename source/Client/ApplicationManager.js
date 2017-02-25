"use strict";

/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2010
*
*/

var ApplicationManager=Object.create(Object);
var ApplicationData = {};

ApplicationManager.init=function(proto){
	console.log("Initializing AppManager ");
}

ApplicationManager.toString=function(){
	return 'ApplicationManager';
}

ApplicationManager.applicationCall = function(message, callback){
	var data = {};
	data["message"] = message;
	Modules.Dispatcher.query("applicationCall", data, callback);
}

ApplicationManager.setAppData = function(data){
	this.ApplicationData = data;
}

ApplicationManager.getAppData = function(){
	return this.ApplicationData;
}


module.exports=ApplicationManager;