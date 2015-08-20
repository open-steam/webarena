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
var cookie = require('cookie');
var io;

SocketServer.init = function (theModules) {
	Modules = theModules;
	var Dispatcher = Modules.Dispatcher;
	var UserManager = Modules.UserManager;

    var ios = require('socket.io-express-session');
	io = require('socket.io')(Modules.WebServer.server);
    io.use(ios(Modules.WebServer.session)); // session support

	io.sockets.on('connection', function (socket) {

		// check if there's a cookie header
		if (socket.handshake.headers.cookie) {
			// if there is, parse the cookie
			var cookiesRaw = cookie.parse(socket.handshake.headers.cookie);
			var cookies = JSON.parse(cookiesRaw.WADIV.replace("j:", ""));

			socket.deviceID = cookies.WADIV;
		}

		UserManager.socketConnect(socket);
		SocketServer.sendToSocket(socket, 'welcome', 0.5);
		
		socket.on('message', function (data) {

			// TODO: find out how to refresh the session expires date
            //if (new Date(socket.handshake.session.cookie.expires) < new Date()) {
            //    return socket.emit('session-expired', {expires:true});
            //}

			// add user info to the data payload (take it from session)
			data.data.passport = socket.handshake.session.passport;

			// make sure everything is fine
			if (!socket.handshake.session.passport) {
				data.data.passport = { user : socket.deviceID };
			}

			Dispatcher.call(socket, data);
		});
		
		socket.on('disconnect', function () {
			UserManager.socketDisconnect(socket);
		});
	});
};

/**
 * Send request to client, add one time response listener.
 *
 * @param socket
 * @param name
 * @param data
 * @param callback
 */
SocketServer.askSocket = function (socket, name, data, callback) {
    var requestID = uuid.v4();
    data.responseID = requestID;
    
    socket.once('response::' + name +'::' + requestID, function(responseData) {
        callback(responseData);
    });

    this.sendToSocket(socket, name, data);
};

SocketServer.sendToSocket = function (socket, name, data) {
	socket.emit('message', {type: 'call', 'name': name, 'data': data});
};

SocketServer.respondToSocket = function (socket, responseID, data) {
	socket.emit('message', {type: 'response', 'id': responseID, 'data': data});
};

module.exports = SocketServer;
