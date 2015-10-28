/**
 * TcpDispatcher is used to provide an API for
 * Plugins that use a TCP connection.
 *
 */
'use strict';

var util = require("util");
var events = require("events");

var Modules = false;
var EventEmitter2 = require('eventemitter2').EventEmitter2;

var TcpDispatcher = new EventEmitter2({
    wildcard: true,
    delimiter: "::"
});

TcpDispatcher.init = function (theModules) {
    Modules = theModules;
}

TcpDispatcher.on("subscribeEvents", function (event) {
    var toSubscribe = event.eventlist;

    if (!toSubscribe) {
        return event.connection.sendMessage({error: "Missing eventlist"});
    }

    if (!util.isArray(toSubscribe)) {
        toSubscribe = [toSubscribe];
    }

    toSubscribe.forEach(function (eventParam) {
        Modules.EventBus.on(eventParam, function (eventData) {

            var eventEnvelope = {
                eventName: this.event,
                eventData: eventData
            };

            event.connection.sendMessage(eventEnvelope);
        });
    });

    event.connection.sendMessage({status: "ok"});
});


module.exports = TcpDispatcher;