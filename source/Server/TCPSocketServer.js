"use strict";


var util = require("util");
var net = require('net');
var _ = require("lodash");

var DEFAULT_PORT = 8125;
var TCPSocketServer = {};


var JsonSocket = require('json-socket');

TCPSocketServer.tcpDispatcher = require('./apihandler/TcpDispatcher.js');

TCPSocketServer.modules = false;

TCPSocketServer.requestToEvent = function(request, connection){
	if (!request.requestType) {
		return connection.sendMessage({"error": "missing argument: requestType."});
	}

	var eventData = {
		connection : connection
	}

	eventData = _.extend(eventData, request);
	this.tcpDispatcher.emit(request.requestType, eventData);
}


TCPSocketServer.init = function (modules) {
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
	return Object.create(TCPSocketServer);
}

module.exports = {
	create: createServer
};