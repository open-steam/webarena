var SocketClient={};

SocketClient.init=function(){
	var url=location.protocol+'//'+location.hostname;
	var socket = io.connect(url);
	Modules.Socket=socket;
	socket.on('message', function (data) {
		//console.log(data);
		if (data.type=='call') Modules.Dispatcher.call(data);
		if (data.type=='response') Modules.Dispatcher.response(data);
	});
}

SocketClient.sendCall=function(type, data, responseID){
	Modules.Socket.emit('message',{'type':type,'data':data,'responseID':responseID});
}
  
SocketClient.serverCall=SocketClient.sendCall;