"use strict";


var util = require("util");
var net = require('net');
var _ = require("underscore");

var DEFAULT_PORT = 8125;
var TCPSocketServer = {};
var theModules = false;

var JsonSocket = require('json-socket');


var onConnectionEnd = function () {
	console.log("Ended connection");
}



var subscriptionHandle = function(connection, parsedRequest){
	var toSubscribe = parsedRequest.eventlist;
	if(!parsedRequest.eventlist){
		connection.sendMessage( {error: "Missing eventlist"});
		return;
	}
	if(!_.isArray(toSubscribe))toSubscribe = [toSubscribe];

	toSubscribe.forEach(function (eventParam) {
		theModules.EventBus.on(eventParam, function (eventData) {

			var eventEnvelope = {
				eventName: this.event,
				eventData: eventData
			};

			connection.sendMessage(eventEnvelope);
		})
	});
	connection.sendMessage({"status": "ok"});
}


/**
 * Handles incoming data
 *
 * @param connection - the tcp connection
 * @param data - incoming Data
 */
var dataHandle = function(connection, parsedRequest){
	if (!parsedRequest.requestType){
		connection.sendMessage({"error": "missing argument: requestType."});
		return;
	}
	else if (parsedRequest.requestType === "subscribeEvents") {
		subscriptionHandle(connection, parsedRequest);
	}
}

TCPSocketServer.init = function (modules) {
	var that = this;
	theModules = modules;

	var server = net.createServer(function (connection) {
		var jsonconnection = new JsonSocket(connection);
		jsonconnection.on('message', function (data) {
			dataHandle(jsonconnection, data);
		});

		jsonconnection.on('end', onConnectionEnd);
	});

	server.listen(DEFAULT_PORT, function () {
		console.log("TCP Server startet");
	});
}

var createServer = function () {
	return Object.create(TCPSocketServer);
}

module.exports = {
	create: createServer
};