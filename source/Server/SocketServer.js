/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

"use strict";

var SocketServer = {};
var Modules = false;
var uuid = require('node-uuid');
var io;

SocketServer.init = function (theModules) {

	Modules = theModules;
	var Dispatcher = Modules.Dispatcher;
	var UserManager = Modules.UserManager;
	io = require('socket.io').listen(Modules.WebServer.server);

	io.sockets.on('connection', function (socket) {
		UserManager.socketConnect(socket);
		
		SocketServer.sendToSocket(socket, 'welcome', 0.5);
		
		socket.on('message', function (data) {
			Dispatcher.call(socket, data);
		});
		socket.on('disconnect', function () {
			UserManager.socketDisconnect(socket);
		});

		//WebRTC:
		/*
		function log(){
			var array = [">>> "];
			for (var i = 0; i < arguments.length; i++) {
				array.push(arguments[i]);
			}
			socket.emit('WebRTC-message', {message:'log', data:array});
		}
		*/

		socket.on('WebRTC-message', function (data) {
			var message = data.message;
			if(message == 'message'){
				var message = data.data;
				var room = data.room;
				//log('Got message: ', message);
				//socket.broadcast.emit('WebRTC-message', {message:'message', data:message}); // should be room only
				io.sockets.in(room).emit('WebRTC-message', {message:'message', data:message});
				if(message == 'bye'){
					socket.leave(room);
					var clients = io.sockets.adapter.rooms[room]; 
					var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;
					if(numClients != 0){
						for(var name in clients){
							var context = Modules.UserManager.getConnectionBySocketID(name);
							context.socket.leave(room);
						}
					}
				}
			}
			if(message == 'create/join'){
				//var numClients = io.sockets.clients(room).length;
			
				var room = data.room;
			
				var clients = io.sockets.adapter.rooms[room]; 
				var numClients = (typeof clients !== 'undefined') ? Object.keys(clients).length : 0;

				//log('Room ' + room + ' has ' + numClients + ' client(s)');
				//log('Request to create or join room', room);

				if (numClients == 0){
					socket.join(room);
					socket.emit('WebRTC-message', {message:'created', data:room});
				} else if (numClients == 1) {
					io.sockets.in(room).emit('WebRTC-message', {message:'join', data:room});
					socket.join(room);
					var callerId = io.sockets.in(room).sockets[0].id;
					var context = Modules.UserManager.getConnectionBySocket(io.sockets.in(room).sockets[0]);
					socket.emit('WebRTC-message', {message:'joined', data:room, callerId:callerId, callerName:context.user.username});
				} else { // max two clients
					socket.emit('WebRTC-message',{message:'full', data:room});
				}
				//socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
				//socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
			}
			if(message == 'invite'){
				var roomId = data.room;
				var partnerId = data.data.partnerId;
				var video = data.data.video;
				var callername = data.data.callername;
				
				var context = Modules.UserManager.getConnectionBySocketID(partnerId);
	
				context.socket.emit('WebRTC-message',{message:'invite', room:roomId, video:video, caller:callername});
			}
			if(message == 'decline'){
				var partnerId = data.data.partner;
				
				var context = Modules.UserManager.getConnectionBySocketID(partnerId);
				
				context.socket.emit('WebRTC-message',{message:'decline'});
			}
			
		});
		
	});

}


/**
 * Send request to client, add one time response listener.
 *
 * @param socket
 * @param name
 * @param data
 * @param callback
 */
SocketServer.askSocket = function (socket, name, data, callback){
    var requestID = uuid.v4();
    data.responseID = requestID;
    socket.once('response::' + name +'::' + requestID, function(responseData){
        callback(responseData);
    });

    this.sendToSocket(socket, name, data);
}


SocketServer.sendToSocket = function (socket, name, data) {
	if (!socket) {
		console.log('ERROR: No socket!');
		console.trace();
		return;
	}
	socket.emit('message', {type: 'call', 'name': name, 'data': data});
}

SocketServer.respondToSocket = function (socket, responseID, data) {
	socket.emit('message', {type: 'response', 'id': responseID, 'data': data});
}


module.exports = SocketServer;