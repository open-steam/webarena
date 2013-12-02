/**
 * The Tcp Socket Server provides the possibility to create a tcp connection
 * to the WebArena server.
 * The main feature is to provide a possibility to connect to the WebArena server
 * using other programming languages.
 *
 * The "coupling" is done by the TcpDispatcher module.
 *
 * Tcp Client can subscribe for certain server events.
 */

"use strict";


var util = require("util");
var net = require('net');
var _ = require("lodash");

var DEFAULT_PORT = 8125;
var TcpSocketServer = {};

/**
 * Json socket is an light-weight wrapper around a socket. Providing
 * the needed abstraction to communicate directly using JSON messages.
 *
 * @type {JsonSocket|exports}
 */
var JsonSocket = require('json-socket');

TcpSocketServer.tcpDispatcher = require('./apihandler/TcpDispatcher.js');

TcpSocketServer.modules = false;

/**
 * Converts an incoming request to a server-event.
 *
 * @param request
 * @param connection
 */
TcpSocketServer.requestToEvent = function(request, connection){
	if (!request.requestType) {
		return connection.sendMessage({"error": "missing argument: requestType."});
	}

	var eventData = {
		connection : connection
	}

	eventData = _.extend(eventData, request);
	this.tcpDispatcher.emit(request.requestType, eventData);
}


TcpSocketServer.init = function (modules) {
	var that = this;
	this.modules = modules;

	this.tcpDispatcher.init(modules);

	var server = net.createServer(function (connection) {
		var jsonconnection = new JsonSocket(connection);
		jsonconnection.on('message', function (data) {
			that.requestToEvent(data, jsonconnection);
		});

		jsonconnection.on('end', onConnectionEnd);
	});

	server.listen(DEFAULT_PORT, function () {
		console.log("TCP Server startet");
	});
}

var onConnectionEnd = function () {
	console.log("Ended connection");
}

var createServer = function () {
	return Object.create(TcpSocketServer);
}

module.exports = {
	create: createServer
};