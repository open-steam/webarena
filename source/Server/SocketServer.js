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

SocketServer.init = function (theModules) {

	Modules = theModules;
	var Dispatcher = Modules.Dispatcher;
	var UserManager = Modules.UserManager;
	var io = require('socket.io').listen(Modules.WebServer.server);
	io.set('log level', 1);

	io.sockets.on('connection', function (socket) {
		UserManager.socketConnect(socket);

		SocketServer.sendToSocket(socket, 'welcome', 0.5);
		socket.on('message', function (data) {
			Dispatcher.call(socket, data);
		});
		socket.on('disconnect', function () {
			UserManager.socketDisconnect(socket);
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
	socket.emit('message', {type: 'call', 'name': name, 'data': data});
}

SocketServer.respondToSocket = function (socket, responseID, data) {
	socket.emit('message', {type: 'response', 'id': responseID, 'data': data});
}

module.exports = SocketServer;