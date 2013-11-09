"use strict";


var util = require("util");
var net = require('net');
var _ = require("underscore");

var DEFAULT_PORT = 8125;
var TCPSocketServer = {};
var theModules = false;


var onConnectionEnd = function () {
	console.log("Ended connection");
}

var emitAsJson = function(connection, object){
	connection.write(JSON.stringify(object));
};

var subscriptionHandle = function(connection, parsedRequest){
	var toSubscribe = parsedRequest.eventlist;
	if(!parsedRequest.eventlist){
		emitAsJson(connection, {error: "Missing eventlist"});
		return;
	}
	if(!_.isArray(toSubscribe))toSubscribe = [toSubscribe];

	toSubscribe.forEach(function (eventParam) {
		theModules.EventBus.on(eventParam, function (eventData) {

			var eventEnvelope = {
				eventName: this.event,
				eventData: eventData
			};

			emitAsJson(connection, eventEnvelope);
		})
	});
	emitAsJson(connection, {"status": "ok"});
}


/**
 * Handles incoming data
 *
 * @param connection - the tcp connection
 * @param data - incoming Data
 */
var dataHandle = function(connection, data){
	try{
		var parsedRequest = JSON.parse(data.toString());
	} catch(e){
		emitAsJson(connection, {"error": "invalid json expression."});
		return;
	}

	if (!parsedRequest.requestType){
		emitAsJson(connection, {"error": "missing argument: requestType."});
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
		connection.on('data', function (data) {
			dataHandle(this, data);
		});

		connection.on('end', onConnectionEnd);

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