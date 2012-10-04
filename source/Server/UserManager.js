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
	this.connections[socket.id]=({'socket':socket,'user':false,'roomIDs':[],'rooms':{}});
}

UserManager.socketDisconnect=function(socket){
	delete(this.connections[socket.id]);
}


UserManager.login=function(socketOrUser,data){
	if(typeof socketOrUser.id=='string') var userID=socketOrUser.id; else var userID=socketOrUser; 
	
	var connection=UserManager.connections[userID];
	if (!connection) {
		Modules.Log.error("UserManager", "+login", "There is no connection for this user (user: '"+userID+"')");
		return;
	}
	
	var socket=connection.socket;
	var connector=Modules.Connector;
	var socketServer=Modules.SocketServer;
	
	
	var userObject=require('./User.js');
	connection.user=new userObject(this);
	connection.user.username=data.username;
	connection.user.password=data.password;
	
	connector.login(data.username,data.password,function(data){
		
		if (data) {
		
			connection.user.home=data.home;
			connection.user.hash='___'+require('crypto').createHash('md5').update(socket.id+connection.user).digest("hex");
		
			socketServer.sendToSocket(socket,'loggedIn',{
				username: connection.user,
				userhash: connection.user.hash
			});
			
		} else {
			socketServer.sendToSocket(socket,'loginFailed','Wrong username or password!');
		}
		
	}, connection);
	
}

UserManager.subscribe=function(socketOrUser,room){
	
	if(typeof socketOrUser.id=='string') var userID=socketOrUser.id; else var userID=socketOrUser;
	
	Modules.Log.debug("UserManager", "+subscribe", "Subscribe (roomID: '"+room+"', user: '"+userID+"')");
	
	var connection=UserManager.connections[userID];
	var ObjectManager=Modules.ObjectManager;
	
	if (!connection) {
		Modules.Log.error("UserManager", "+subscribe", "There is no connection for this user (user: '"+userID+"')");
		return;
	}
	var socket=connection.socket;
	var connector=Modules.Connector;
	var socketServer=Modules.SocketServer;
	var user=connection.user;
	var roomIDs=connection.roomIDs;
	var roomID = room;
	
	connector.maySubscribe(room,connection, function(maySub) {

		if (maySub) {
			
			if (!isInArray(roomIDs,roomID)){
				roomIDs.push(roomID);
			}
			connection.roomIDs=roomIDs;
			
			ObjectManager.getRoom(roomID,connection,function(room){
				socketServer.sendToSocket(socket,'subscribed',roomIDs);
				connection.rooms[roomID]=room;
				for (var i in roomIDs){
					var room=roomIDs[i];
					ObjectManager.sendRoom(socket,room);
				}
			})

		} else {
			socketServer.sendToSocket(socket,'error', 'User '+userID+' may not subscribe to '+roomID);
		}
		
	});
		
		

}

UserManager.unsubscribe=function(socketOrUser,room){
	if(typeof socketOrUser.id=='string') var userID=socketOrUser.id; else var userID=socketOrUser;	
	
	var connection=UserManager.connections[userID];
	if (!connection) {
		Modules.Log.error("UserManager", "+login", "There is no connection for this user (user: '"+userID+"')");
		return;
	}
	var socket=connection.socket;
	var connector=Modules.Connector;
	var socketServer=Modules.SocketServer;
	var user=connection.user;
	var roomIDs=connection.roomIDs;
	
	var temp=[];
	for (var i=0;i<roomIDs.length;i++){
		if (roomIDs[i]!==room) {
			temp.push(roomIDs[i]);
		} else {
			delete(connection.rooms[roomID]);
		}
	}

	connection.roomIDs=temp;
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
		var roomIDs=connection.roomIDs;
		for (var i in roomIDs){
			var compare=roomIDs[i];
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

UserManager.getConnectionByUserHash=function(userHash){
	for (var i in this.connections){
		var connection=this.connections[i];
		if (connection.user.hash==userHash) return connection;
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