"use strict";

function SocketClient() {
	var url = location.protocol + '//' + location.hostname;
	this.socket = io.connect(url);

	this.socket.on('message', function(data) {

		// console.log(data);
		if (data.type == 'call') {
			//console.log("Call ->");
			//console.log(data);

			Modules.Dispatcher.call(data);
		}
		
		if (data.type == 'response') {
			//console.log("Response ->");
			//console.log(data);

			Modules.Dispatcher.response(data);
		}
	});

	this.socket.on('disconnect', function() {
		GUI.disconnected();
	});

	this.socket.on('connect', function() {
		GUI.connected();
	});

	this.socket.on('session-expired', function() {
		window.location = "/login";
	});
}

/**
 * @function sendCall
 * @desc Sends a message to the server
 * @param {Object} type the type of call.
 * @param {Object} data the data to be sent to the server.
 * @param {Object} responseID the response id.
 */
SocketClient.prototype.serverCall = SocketClient.prototype.sendCall = function(type, data, responseID) {
	this.socket.emit('message', {
		'type' : type,
		'data' : data,
		'responseID' : responseID
	});
}

SocketClient.prototype.sendWebRTCCall = function(message, data, room) {
	this.socket.emit('WebRTC-message', {
		'message' : message,
		'data' : data,
		'room' : room
	});
}

SocketClient.prototype.getSocket = function() {
	return this.socket;
}

