/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2015
 *
 */


"use strict";

var fs = require('fs');
var async = require("async");
var ApplicationManager = {};
var Applications={};

var Modules = false;

ApplicationManager.toString = function() {
    return 'Application Manager';
}


/**
 *  init
 *
 *  initializes the ObjectManager
 **/
ApplicationManager.init = function(theModules) {
	if (this.initialized) return;
    var that = this;
    Modules = theModules;
	this.initialized=true;
	
	for (var i in Modules.config.enabledApplications){
		var appName=Modules.config.enabledApplications[i];
		try {
		    var app=require('./applications/'+appName+'.js');
		    app.init(appName,Modules);
		    Applications[appName]=app;
		} catch (err) {
		    console.log('ERROR: cannot start application '+appName+' '+err);
		}
	}
}

ApplicationManager.message=function(identifier,object,data){
	if (data) {
		console.log('ApplicationManager.message: '+identifier+': '+object,data);
	} 
	
	for (var appName in Applications){
		var app=Applications[appName];
		process.nextTick(function(){
			app.message(identifier,object,data);
		});
	}
	
}


ApplicationManager.event=function(identifier,object,data){
	if (data) {
		console.log('ApplicationManager.event: '+identifier+': '+object,data);
	} 
		
	for (var appName in Applications){
		var app=Applications[appName];
		process.nextTick(function(){
			app.event(identifier,object,data);
		});
	}
}



module.exports = ApplicationManager;