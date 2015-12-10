"use strict";
var SocketClient={};

SocketClient.init=function(){
	var url=location.protocol+'//'+location.hostname+':'+location.port;
	var socket = io.connect(url);
	Modules.Socket=socket;
	socket.on('message', function (data) {
		//console.log(data);
		if (data.type=='call') Modules.Dispatcher.call(data);
		if (data.type=='response') Modules.Dispatcher.response(data);
	});
	socket.on('disconnect', function() {
		GUI.disconnected();
	});
	socket.on('connect', function () {
		GUI.connected();
	});
	socket.on('WebRTC-message', function(data){
		WebRTCManager.receiveMessage(data);
	});
}

SocketClient.sendCall=function(type, data, responseID){
	if(!Modules.Socket){return;}
	Modules.Socket.emit('message',{'type':type,'data':data,'responseID':responseID});
}

SocketClient.sendWebRTCCall=function(message, data, room){
	if(!Modules.Socket){return;}
	Modules.Socket.emit('WebRTC-message',{'message':message,'data':data, 'room':room});
}
  
SocketClient.serverCall=SocketClient.sendCall;