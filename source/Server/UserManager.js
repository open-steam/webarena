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
var async = require('async');

var UserManager={};

var enter=String.fromCharCode(10);

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

	var room=this.getConnectionBySocket(socket).room;

	delete(this.connections[socket.id]);

	if (room) {
		UserManager.sendAwarenessData(room.id);
	}

}

function loggedInInfo(){
	var connections=UserManager.connections;

	var count=0;
	var userInfo='';
	for (var i in connections){
		var data=connections[i];

		if (!data.user.username) continue;

		count++;
		if (count>1) userInfo+='; ';
		userInfo+=data.user.username+' in ';
		if (data.room) {
			userInfo+=data.room.id;
		}
		if (data.device) {
			//Append user's device for this particular connection.
			userInfo+=JSON.stringify(data.device);
		}

	}
	console.log(count+' users: '+userInfo);
}


/**
 *	login
 *
 *	when a user tries to log in, his credentials are tested and added to the connection
 *
 *  Update for CCD- This method invokes the server side detection (if required), finalizing of the device class and assimilates the Data Store Properties(DSP) before invoking the login mechanism. Additionally, the default values for non WebRTC compliant devices can also be performed.
 **/
UserManager.login=function(socketOrUser,data){

	//If device capabilities detection was not previously performed for current device.
	if(!data.deviceCapabilities.isRetrieved) {
		//Initiating Server side device capabilities detection
		var UserAgent = {};
		UserAgent = socketOrUser.request.headers['user-agent'];
		var ServerDeviceDetection = Modules.ServerDeviceDetection;
		var ServerDeviceDetectionResult = {};
		ServerDeviceDetectionResult  = ServerDeviceDetection.UserAgentParsing(UserAgent.toLowerCase());

		//Assign the 'KT-Keyboard Type' value based on Server side detection.
		data.deviceCapabilities.KT = ServerDeviceDetectionResult.KT;

		//IMPORTANT
		//Tackling non WebRTC compliant devices, filling in of default values for test purposes. To be commented out for live deployment.
		//if (ServerDResult.name == "Apple") {
		//	data.deviceCapabilities.CVS = ServerDResult.CVS;
		//	data.deviceCapabilities.AS = ServerDResult.AS;
		//}

		//Finalizing the 'FF-Form Factor' value based on client and server side detection results.
		var finalFormFactor = ServerDeviceDetection.FinalizeFormFactor(ServerDeviceDetectionResult.FF, data.deviceCapabilities.FF);
		//Subsequently finalizing the 'deviceClass' Data Store Property value,
		var DeviceClass = ServerDeviceDetection.FinalizeDeviceClass(finalFormFactor,data.deviceCapabilities);
		data.deviceCapabilities.deviceClass = DeviceClass;

		console.log("Assigned FF after full detection-----" + data.deviceCapabilities.FF);

		console.log("Raw device properties after Server side Detection-\n" + JSON.stringify(data.deviceCapabilities));
		//FILLING OF THE Data Store Properties (DSP)

		
		//Assigning remaining Data Store Property(DSP) values.
		data.deviceCapabilities.deviceVideoStreamCount = data.deviceCapabilities.CVS;
		data.deviceCapabilities.deviceAudioStreamCount = data.deviceCapabilities.AS;
		data.deviceCapabilities.deviceKeyboardClass = data.deviceCapabilities.KT;

		//Assigning 'deviceScreenClass' DSP property, 1(X-Large)>2(Large)>3(Medium)>4(Small)
		switch (data.deviceCapabilities.deviceClass) {
			case "Smartphone":
				data.deviceCapabilities.deviceScreenClass = 4;
				break;

			case "Tablet":
				data.deviceCapabilities.deviceScreenClass = 3;
				break;

			case "Laptop":
				data.deviceCapabilities.deviceScreenClass = 2;
				break;

			case "Desktop":
				data.deviceCapabilities.deviceScreenClass = 2;
				break;

			case "Smarttv":
				data.deviceCapabilities.deviceScreenClass = 1;
				break;

			default:
				break;
		}
	}

		console.log("Device capability properties including Data Store Properties (DSP)-\n" + JSON.stringify(data.deviceCapabilities));


		if (typeof socketOrUser.id == 'string') var userID = socketOrUser.id; else var userID = socketOrUser;

		var connection = UserManager.connections[userID];

		//var deviceCapabilitiesDetected= JSON.parse(JSON.stringify(data.deviceCapabilities));
		var deviceCapabilitiesDetected= data.deviceCapabilities;

		if (!connection) {
			Modules.Log.error("UserManager", "+login", "There is no connection for this user (user: '" + userID + "')");
			return;
		}

		var socket = connection.socket;
		var connector = Modules.Connector;
		var socketServer = Modules.SocketServer;

		//try to login on the connector
		connector.login(data.username, data.password, data.externalSession, connection, deviceCapabilitiesDetected, function (data) {

			//if the connector returns data, login was successful. In this case
			//a new user object is created and a loggedIn event is sent to the
			//client

			if (data) {

				//console.log("UM:login---data.stringify---"+JSON.stringify(data));

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

				var userColor = colors[Math.floor(Math.random() * colors.length)];

				var userObject = require('./User.js');
				connection.user = new userObject(this);
				connection.user.username = data.username;
				connection.user.password = data.password;
				connection.user.color = userColor;
				connection.user.externalSession = data.externalSession;
				connection.user.id = socket.id;
				//Appending raw device capabilites and Data Store Properties (DSP) along with the user login registration.
				connection.device = data.deviceCapabilitiesLogin;
				connection.isAssigned = false;

				connection.user.home = data.home; //public by default
				connection.user.hash = '___' + require('crypto').createHash('md5').update(socket.id + connection.user).digest("hex");

				//passing back to clinet side detected device capabilities, for it to be stored as local storage entry.
				socketServer.sendToSocket(socket, 'loggedIn', {
					userData: connection.user,
					userhash: connection.user.hash,
					home: connection.user.home,
					deviceCapabilitiesConsolidated: connection.device
				});

			} else {
				socketServer.sendToSocket(socket, 'loginFailed', 'Wrong username or password!');
			}

		});

}

/**
 *	enterRoom
 *
 *	let a user enter a room with a specific roomID
 **/
UserManager.enterRoom=function(socketOrUser,data,responseID){

	if(typeof socketOrUser.id=='string') var userID=socketOrUser.id; else var userID=socketOrUser;

	var roomID = data.roomID;

	if (roomID=='trash') {
		Modules.Log.warning("UserManager", "+enter", "Tried to enter trash (user: '"+userID+"')");
		return;
	}

	var connection=UserManager.connections[userID];
	var ObjectManager=Modules.ObjectManager;

	//oldrooom is sent down to the connector, which may use it for parent creation
	if (connection.room) {
		var oldRoomId=connection.room.id;
	}

	if (!connection) {
		Modules.Log.error("UserManager", "+enter", "There is no connection for this user (user: '"+userID+"')");
		return;
	}
	var socket=connection.socket;
	var connector=Modules.Connector;
	var socketServer=Modules.SocketServer;
	var user=connection.user;

	//try to enter the room on the connector
	connector.mayEnter(roomID,connection, function(err, mayEnter) {

		//if the connector responds true, the client is informed about the successful entering of the room
		//and all clients in the same rooms get new awarenessData.

		if (mayEnter) {

			ObjectManager.getRoom(roomID,connection,oldRoomId,function(room){
				connection.room = room;
				Modules.RoomController.sendRoom(socket,room.id);
				socketServer.sendToSocket(socket,'entered',room.id);
				UserManager.sendAwarenessData(room.id);
			});

			//ObjectManager.sendChatMessages(roomID,socket);

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
	loggedInInfo();
}

/**
 *	getConnections
 *	getConnctionsForRoom
 *	getConnectionBySocket
 *	getConnectionBySocketID
 *	getConnectionByUserHash
 *
 *	a number of getters to get access to connection information
 **/

UserManager.getConnections=function(){
	return this.connections;
}

UserManager.getConnectionsForRoom=function(roomID){
	var result={};
	for (var connectionID in this.connections){

		var connection=this.connections[connectionID];

		if (connection.room && roomID==connection.room.id) {
			result[connectionID]=connection;
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

UserManager.getUserLocations=function(){

	var connections=UserManager.connections;

	var userData=[];
	for (var i in connections){
		var data=connections[i];

		if (!data.user.username) continue;

		var obj={}
		obj.username=data.user.username;
		obj.room=data.room;

		userData.push(obj);
	}

	return userData;

}

UserManager.getUserRooms=function(context,callback){

	var locations=this.getUserLocations();

	var mayAccess=function(element,callback){

		//There should be a rights check here. Not done so far for prototype purposes

		callback(true);
	}

	async.filter(locations,mayAccess,function(results){

		var ret={};

		for (var i in results){
			var element=results[i];
			ret[element.username]=element.room;
		}

		callback(ret);
	});

}

UserManager.isGod=function(context,callback){
	//TODO: Check for god :D - down to the connector
	callback(true);
}

module.exports=UserManager;