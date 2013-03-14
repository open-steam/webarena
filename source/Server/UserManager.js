/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

/**
*	the UserManager holds connection information. For every connection, it saves
*	information about who is logged in, which room he is in
*	and the socket. Actual socket connections are handled by SocketServer
**/

"use strict";

var Modules=false;

var UserManager={};

UserManager.connections={};

UserManager.init=function(theModules){
 	Modules=theModules;
	var Dispatcher=Modules.Dispatcher;
	Dispatcher.registerCall('login',UserManager.login);
    Dispatcher.registerCall('enter',UserManager.enterRoom);
}

/**
*	socketConnect
*
*	in case of a new connection, a new entry is created.
**/
UserManager.socketConnect=function(socket){
	this.connections[socket.id]=({'socket':socket,'user':false,'room':false});
}

/**
*	socketDisconnect
*
*	delete all connection data, when a socket disconnects
*	and informs all remaining users in the user's room about
*	the disconnect
*
**/
UserManager.socketDisconnect=function(socket){
	
	var roomID=this.getConnectionBySocket(socket).room.id;
	
	delete(this.connections[socket.id]);
	
	UserManager.sendAwarenessData(roomID);
	
}


/**
*	login
*
*	when a user tries to log in, his credentials are tested and added to the connection
**/
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
	
	//try to login on the connector
	connector.login(data.username,data.password, data.externalSession, function(data){
		
		//if the connector returns data, login was successful. In this case
		//a new user object is created and a loggedIn event is sent to the
		//client
		
		if (data) {
		
			var colors = [
				"#398da8",
				"#39a842",
				"#a84d39",
				"#a8398e",
				"#a2a839",
				"#39a899",
				"#74a839",
				"#a87639",
				"#1d68c4",
				"#c41d73",
				"#1dc46e",
				"#c46b1d",
			];
			
			var userColor = colors[Math.floor(Math.random() * colors.length+1)];
		
			var userObject=require('./User.js');
			connection.user=new userObject(this);
			connection.user.username=data.username;
			connection.user.password=data.password;
			connection.user.color=userColor;
			connection.user.externalSession = data.externalSession;
			connection.user.id = socket.id;
		
			connection.user.home=data.home;
			connection.user.hash='___'+require('crypto').createHash('md5').update(socket.id+connection.user).digest("hex");
		
			socketServer.sendToSocket(socket,'loggedIn',{
				userData: connection.user,
				userhash: connection.user.hash,
				home: connection.user.home
			});
			
		} else {
			socketServer.sendToSocket(socket,'loginFailed','Wrong username or password!');
		}
		
	}, connection);
	
}

/**
*	enterRoom
*
*	let a user enter a room with a specific roomID
**/
UserManager.enterRoom=function(socketOrUser,roomID,responseID){
	
	if(typeof socketOrUser.id=='string') var userID=socketOrUser.id; else var userID=socketOrUser;
	
	var connection=UserManager.connections[userID];
	var ObjectManager=Modules.ObjectManager;
	
	if (!connection) {
		Modules.Log.error("UserManager", "+enter", "There is no connection for this user (user: '"+userID+"')");
		return;
	}
	var socket=connection.socket;
	var connector=Modules.Connector;
	var socketServer=Modules.SocketServer;
	var user=connection.user;
	
	//try to enter the room on the connector
	connector.mayEnter(roomID,connection, function(mayEnter) {

		//if the connector responds true, the client is informed about the successful entering of the room
		//and all clients in the same rooms get new awarenessData.

		if (mayEnter) {
			
			ObjectManager.getRoom(roomID,connection,function(room){			
				connection.room=room;
				ObjectManager.sendRoom(socket,room.id);
				socketServer.sendToSocket(socket,'entered',room.id);
				UserManager.sendAwarenessData(room.id);
			});
			
			Modules.Dispatcher.respond(socket,responseID,false);

		} else {
			socketServer.sendToSocket(socket,'error', 'User '+user.username+' may not enter '+roomID);
			Modules.Dispatcher.respond(socket,responseID,true);
		}
		
	});
		
		

}

/**
*	getArarenessData
*
*	awarenessData is a set of information about the users in the current room.
*	This may be extended further, when user get their own objects
**/
UserManager.getAwarenessData=function(roomID,connections){
	var awarenessData={};
	awarenessData.room=roomID;
	awarenessData.present=[];
	for (var i in connections){
		var con=connections[i];
		
		var presData={};
		presData.username=con.user.username;
		presData.id=i;
		presData.color=con.user.color;
		awarenessData.present.push(presData);
	}
	return awarenessData;
}

/**
*	sendAwarenessData
*
*	sends awarenessData about a room to all clients within that room.
**/
UserManager.sendAwarenessData=function(roomID){
	var connections=UserManager.getConnectionsForRoom(roomID);
						
	var awarenessData=UserManager.getAwarenessData(roomID,connections);
	
	for (var i in connections){
		var con=connections[i];
		var sock=con.socket;
		
		var data={};
		data.message={};
		data.message['awareness']=awarenessData;
		data.room=roomID;
		data.user='Server';
		
		Modules.SocketServer.sendToSocket(sock,'inform',data);
	}
}

/**
*	getConnctionsForRoom
*	getConnectionBySocket
*	getConnectionBySocketID
*	getConnectionByUserHash
*
*	a number of getters to get access to connection information
**/
UserManager.getConnectionsForRoom=function(roomID){
	var result={};
	for (var connectionID in this.connections){
		var connection=this.connections[connectionID];
		if (roomID==connection.room.id) result[connectionID]=connection;
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