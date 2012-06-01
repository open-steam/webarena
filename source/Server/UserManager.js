/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var Modules=false;

var UserManager={};

UserManager.connections={};

UserManager.socketConnect=function(socket){
	this.connections[socket.id]=({'socket':socket,'user':false,'rooms':[]});
}

UserManager.socketDisconnect=function(socket){
	delete(this.connections[socket.id]);
}


UserManager.login=function(socketOrUser,data){
	if(typeof socketOrUser.id=='string') var userID=socketOrUser.id; else var userID=socketOrUser; 
	
	var connection=UserManager.connections[userID];
	if (!connection) {
		console.log('ERROR: There is no connection for '+userID);
		return;
	}
	
	var socket=connection.socket;
	var connector=Modules.Connector;
	var socketServer=Modules.SocketServer;
	
	var success=connector.login(data.username,data.password,function(data){
		var userObject=require('./User.js');
		connection.user=new userObject(this);
		connection.user.username=data.username;
		connection.user.password=data.password;
		connection.user.home=data.home;
		connection.user.hash='###'+require('crypto').createHash('md5').update(socket.id+connection.user).digest("hex");
	});
	
	if (success) socketServer.sendToSocket(socket,'loggedIn',connection.user);
	else socketServer.sendToSocket(socket,'loginFailed','Wrong username or password!');
	
}

UserManager.subscribe=function(socketOrUser,room){
	if(typeof socketOrUser.id=='string') var userID=socketOrUser.id; else var userID=socketOrUser;
	
	var connection=UserManager.connections[userID];
	var ObjectManager=Modules.ObjectManager;
	
	if (!connection) {
		console.log('ERROR: There is no connection for '+userID);
		return;
	}
	var socket=connection.socket;
	var connector=Modules.Connector;
	var socketServer=Modules.SocketServer;
	var user=connection.user;
	var rooms=connection.rooms;
	
	if (connector.maySubscribe(room,connection)){
		
		if (!isInArray(rooms,room)){
			rooms.push(room);
		}
		connection.rooms=rooms;
		socketServer.sendToSocket(socket,'subscribed',rooms);
		for (var i in rooms){
			var room=rooms[i];
			ObjectManager.sendRoom(socket,room);
		}
		
	} else {
		socketServer.sendToSocket(socket,'error', 'User '+userID+' may not subscribe to '+room);
	}

}

UserManager.unsubscribe=function(socketOrUser,room){
	if(typeof socketOrUser.id=='string') var userID=socketOrUser.id; else var userID=socketOrUser;	
	
	var connection=UserManager.connections[userID];
	if (!connection) {
		console.log('ERROR: There is no connection for '+userID);
		return;
	}
	var socket=connection.socket;
	var connector=Modules.Connector;
	var socketServer=Modules.SocketServer;
	var user=connection.user;
	var rooms=connection.rooms;
	
	var temp=[];
	for (var i=0;i<rooms.length;i++){
		if (rooms[i]!==room) {
			temp.push(rooms[i]);
		}
	}

	connection.rooms=temp;
	socketServer.sendToSocket(socket,'subscribed',temp);
		
	
}

UserManager.init=function(theModules){
 	Modules=theModules;
	var Dispatcher=Modules.Dispatcher;
	Dispatcher.registerCall('login',UserManager.login);
    Dispatcher.registerCall('subscribe',UserManager.subscribe);
    Dispatcher.registerCall('unsubscribe',UserManager.unsubscribe);
}

UserManager.getConnectionsForRoom=function(roomID){
	var result={};
	for (var connectionID in this.connections){
		var connection=this.connections[connectionID];
		var rooms=connection.rooms;
		for (var i in rooms){
			var compare=rooms[i];
			if (roomID===compare) result[connectionID]=connection;
		}
	}
	return result;
}

UserManager.getConnectionBySocket=function(socket){
	for (var i in this.connections){
		var connection=this.connections[i];
		if (connection.socket==socket) return connection;
	}
	return false;
}

UserManager.getConnectionBySocketID=function(socketID){
	for (var i in this.connections){
		var connection=this.connections[i];
		if (connection.socket.id==socketID) return connection;
	}
	return false;
}

module.exports=UserManager;

function isInArray(haystack,needle){
	for(var i = 0; i < haystack.length; i++){
	   if(haystack[i] === needle) return true;
	}
	return false;
}