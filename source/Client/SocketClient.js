"use strict";
var SocketClient = {};

SocketClient.init = function() {
	
	var url = location.protocol + '//' + location.hostname;
	var socket = io.connect(url);
	Modules.Socket = socket;
	
	socket.on('message', function(data) {
		
		// console.log(data);
		if (data.type == 'call') {
			Modules.Dispatcher.call(data);
		}
		
		if (data.type == 'response') {
			Modules.Dispatcher.response(data);
		}
	});
	
	socket.on('disconnect', function() {
		GUI.disconnected();
	});
	
	socket.on('connect', function() {
		GUI.connected();
	});
	
	socket.on('WebRTC-message', function(data) {
		WebRTCManager.receiveMessage(data);
	});
}

/**
 * @function sendCall
 * @desc Sends a message to the server
 * @param {Object} type the type of call.
 * @param {Object} data the data to be sent to the server.
 * @param {Object} responseID the response id.
 */
SocketClient.sendCall = function(type, data, responseID) {
	Modules.Socket.emit('message', {
		'type' : type,
		'data' : data,
		'responseID' : responseID
	});
}

SocketClient.sendWebRTCCall = function(message, data, room) {
	Modules.Socket.emit('WebRTC-message', {
		'message' : message,
		'data' : data,
		'room' : room
	});
}

SocketClient.serverCall = SocketClient.sendCall;