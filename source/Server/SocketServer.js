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
var channels = {}; //new, for WebRTC
var io;

SocketServer.init = function (theModules) {

	Modules = theModules;
	var Dispatcher = Modules.Dispatcher;
	var UserManager = Modules.UserManager;
	io = require('socket.io').listen(Modules.WebServer.server);

	io.sockets.on('connection', function (socket) {
		UserManager.socketConnect(socket);
		
		
		//new, for WebRTC
		var initiatorChannel = '';
		if (!io.isConnected) {
			io.isConnected = true;
		}
		

		SocketServer.sendToSocket(socket, 'welcome', 0.5);
		socket.on('message', function (data) {
			Dispatcher.call(socket, data);
		});
		socket.on('disconnect', function () {
			UserManager.socketDisconnect(socket);
		});
				
		//new, for WebRTC
		socket.on('new-WebRTC-channel', function (data) {
			if (!channels[data.channel]) {
				initiatorChannel = data.channel;
			}

			channels[data.channel] = data.channel;
			onNewNamespace(data.channel, data.sender);
		});
		
		//new, for WebRTC
		socket.on('presence', function (channel) {
			var isChannelPresent = !! channels[channel];
			socket.emit('presence', isChannelPresent);
		});

		//new, for WebRTC
		socket.on('disconnect', function (channel) {
			if (initiatorChannel) {
				delete channels[initiatorChannel];
			}
		});

	});

}


/**
 * 
 * new, for WebRTC
 */
function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        var username;
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('WebRTC-message', function (data) {
            if (data.sender == sender) {
                if(!username) username = data.data.sender;
                
				var url = socket.handshake.headers.referer;
				var s = url.split("/");
				
                socket.broadcast.emit('WebRTC-message', data.data);
            }
        });
        
        socket.on('disconnect', function() {
            if(username) {
			
				var url = socket.handshake.headers.referer;
				var s = url.split("/");
			
                socket.broadcast.emit('user-left', username);
                username = null;
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
	socket.emit('message', {type: 'call', 'name': name, 'data': data});
}

SocketServer.respondToSocket = function (socket, responseID, data) {
	socket.emit('message', {type: 'response', 'id': responseID, 'data': data});
}


module.exports = SocketServer;