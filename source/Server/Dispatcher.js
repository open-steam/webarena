/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var Modules=false; //set in init
var Dispatcher={};
var calls={};

/**
*	The dispatcher is the connection between requests sent to the server by websocket
*	and the functions that are called inside the server. Server Modules register functions
*	on the dispatcher, that react on certain calls by the client. The websocket server
*	calls the call-function of the dispatcher in case of an incoming communication.
*/

Dispatcher.call=function(socket,message){
	var SocketServer=Modules.SocketServer;
	var type=message.type;
	var responseID=message.responseID;
	var data=message.data;
	
	if (calls[type]){
		process.nextTick(function(){ 

			var response=calls[type](socket,data,responseID); 		//TODO: this is still blocking, swtich to callbacks if necessary

			//TODO: Fire an event
				/**
				*	Clients can provide a unique responseID when calling a function on the server. If the
				*	function called has a result other than undefined and a responseID is given, the response
				*	is sent back to the client (including the responseID)
				*/
				if (responseID!==undefined && response!==undefined) Modules.Dispatcher.respond(socket,responseID,response);
		});
	} else {
		console.log('ERROR: No function for '+type);
		SocketServer.sendToSocket(socket,'error','ERROR: No function for '+type);
	}
}

Dispatcher.respond=function(socket,responseID,response){
	Modules.SocketServer.respondToSocket(socket,responseID,response);
}

/**
*	register a function for an incoming call type
*/
Dispatcher.registerCall=function(type,callFunction){
	if (!callFunction) return;
	calls[type]=callFunction;
}


Dispatcher.init=function(theModules){
	Modules=theModules;
}

Dispatcher.registerCall('deleteObject', function (socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ObjectManager.deleteObject(data, context, resultCallbackWrapper(socket, responseID));
});

Dispatcher.registerCall('createObject', function (socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ObjectController.createObject(data, context, resultCallbackWrapper(socket, responseID));
});

Dispatcher.registerCall('roomlist' , function(socket, data, responseID){
	Modules.RoomController.listRooms(resultCallbackWrapper(socket, responseID));
});

Dispatcher.registerCall('getPreviewableMimeTypes', function (socket, data, responseID) {
	Dispatcher.respond(socket, responseID, Modules.Connector.getInlinePreviewMimeTypes());
});

Dispatcher.registerCall('memoryUsage', function (socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ServerController.getMemoryUsage(data, context, resultCallbackWrapper(socket, responseID));
});

//Information are sent to all clients in the same room
Dispatcher.registerCall('inform', function (socket, data, responseID) {
	Modules.RoomController.informAllInRoom(data, resultCallbackWrapper(socket, responseID));
});

Dispatcher.registerCall('bugreport', function (socket, data, responseID) {
	Modules.ServerController.bugreport(data, resultCallbackWrapper(socket, responseID));
});

Dispatcher.registerCall('undo', function(socket, data, responseID){
	var context = Modules.UserManager.getConnectionBySocket(socket);
    Modules.ObjectManager.undo( data, context, infoCallbackWrapper(socket)  );
});

Dispatcher.registerCall('duplicateObjects', function(socket, data, responseID){
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ObjectManager.duplicateNew(data, context, resultCallbackWrapper(socket, responseID));
});

Dispatcher.registerCall('serverCall', function (socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.ObjectController.executeServersideAction(data, context, resultCallbackWrapper(socket, responseID));
});

/**
 * Creates a callback function that sends the result as an info message to the client.
 *
 * @param socket
 * @returns {Function}
 */
function infoCallbackWrapper(socket){
	return function(err, message){
		if(err) Modules.SocketServer.sendToSocket(socket, 'error', err.message);
		else Modules.SocketServer.sendToSocket(socket, 'infotext', message);
	};
}

/**
 * Creates a callback function that sends the result message to the client.
 *
 * @param socket
 * @param responseID
 * @returns {Function}
 */
function resultCallbackWrapper(socket, responseID){
	return function(err, data){
		if(err){
			Modules.SocketServer.sendToSocket(socket, 'error', err.message);
		} else {
			Modules.Dispatcher.respond(socket, responseID, data);
		}
	}
}



module.exports=Dispatcher;
