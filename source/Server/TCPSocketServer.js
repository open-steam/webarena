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

TCPSocketServer.init = function (modules) {
	var that = this;
	theModules = modules;

	var server = net.createServer(function (connection) {
		connection.on('data', function (data) {
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
			if (parsedRequest.requestType && parsedRequest.requestType === "serverCall"){

			}
			else if (parsedRequest.requestType && parsedRequest.requestType === "subscribeEvents") {
				var toSubscribe = parsedRequest.eventlist;
				if(!parsedRequest.eventlist){
					emitAsJson(connection, {error: "Missing eventlist"});
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
		});

		connection.on('end', onConnectionEnd);

	});

	server.listen(DEFAULT_PORT, function () {
		console.log("TCP Server startet");
	});
}

var createServer = function () {
	var s = Object.create(TCPSocketServer);

	return s;
}

module.exports = {
	create: createServer
};