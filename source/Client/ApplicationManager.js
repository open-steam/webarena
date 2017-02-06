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

ApplicationManager.applicationCall = function(message, data, callback){
	var data = {};
	data["message"] = message; 
	console.log(data);
	Modules.Dispatcher.query("applicationCall", data, this.setAppData);
}

ApplicationManager.setAppData = function(data){
	console.log("setAppData call successfull: ");
	console.dir(data);
	this.ApplicationData = data;
}

module.exports=ApplicationManager;