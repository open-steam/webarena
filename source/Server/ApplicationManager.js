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


var GodUser={};
GodUser.name='God';
GodUser.isGod=true;
GodUser.toString='God';

function godify(original){
	if (!original) return original;
	if (!original.context) return original;
	
	var object=Object.create(original);
	object.context=Object.create(object.context);
	object.context.originalUser=object.context.user;
	object.context.user=GodUser;
	
	return object;	
}

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
		    console.log('Loaded application '+appName);
		} catch (err) {
		    console.log('ERROR: cannot start application '+appName+' '+err);
		}
	}
}

ApplicationManager.message=function(identifier,object,data){
	
	object=godify(object);
		
	for (var appName in Applications){
		var app=Applications[appName];
		
		function deliver(app){
			process.nextTick(function(){
				app.message(identifier,object,data);
			});						
		}
		
		deliver(app);

	}
	
}


ApplicationManager.event=function(identifier,object,data){
	
	object=godify(object);
			
	for (var appName in Applications){
		var app=Applications[appName];
		
		function deliver(app){
			process.nextTick(function(){
				app.event(identifier,object,data);
			});						
		}
		
		deliver(app);

	}
	
}

ApplicationManager.sendUserToRoom=function(user,room,callback){
	
	var userID=false;
	var roomID=false;
	
	if (typeof user=='string'){userID=user;}
	else if (typeof user=='object'){
		userID=user.id;
	}
	
	if (!userID){
		console.log('ERROR! Could not find the user!',user);
		return callback(false);
	}

	if (typeof room=='string'){roomID=room;}
	else if (typeof room=='object'){
		roomID=room.id;
	}
	
	if (!roomID){
		console.log('ERROR! Could not find the room!',room);
		return callback(false);
	}


	var connection=Modules.UserManager.getConnectionByUserID(userID);
	
	Modules.SocketServer.sendToSocket(connection.socket, 'goToRoom', roomID);
	
	if (callback) callback();
}



module.exports = ApplicationManager;