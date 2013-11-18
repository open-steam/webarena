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

			var response=calls[type](socket,data,responseID); 		// this is still blocking, swtich to callbacks if necessary

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
	Modules.ObjectManager.deleteObject(data, context, wrapper(socket, responseID));
});

Dispatcher.registerCall('createObject', function (socket, data, responseID) {
	var context = Modules.UserManager.getConnectionBySocket(socket);
	Modules.RoomController.createObject(data, context, wrapper(socket, responseID));
});

function wrapper(socket, responseID){
	return function(err, data){
		if(err){
			Modules.SocketServer.sendToSocket(socket, 'error', err.message);
		} else {
			Modules.Dispatcher.respond(socket, responseID, data);
		}
	}
}

module.exports=Dispatcher;