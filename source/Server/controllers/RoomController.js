/**
 * Contains room related tasks
 */

var RoomController = {}

var Modules = false;





RoomController.init = function(theModules){
	Modules = theModules;
}

RoomController.createObject = function(data, context, callback){

	var roomID = data.roomID;
	var type = data.type;
	var attributes = data.attributes;
	var content = data.content;

	var afterRightsCheck = function(err, mayInsert){
		if(err){
			callback(err, null);
		} else {
			if(mayInsert){
				Modules.ObjectManager.createObject(roomID, type, attributes, content, context, callback);
			} else {
				callback(new Error("No rights to write into room: " + roomID), null);
			}

		}
	}

	Modules.Connector.mayInsert(roomID, context, afterRightsCheck)
}

RoomController.listRooms = function(callback){
	Modules.Connector.listRooms(callback)
}

//Information are sent to all clients in the same room
RoomController.informAllInRoom =  function (data, callback) {

	var connections = Modules.UserManager.getConnectionsForRoom(data.room);

	for (var i in connections) {
		var socket = connections[i].socket;
		Modules.SocketServer.sendToSocket(socket, 'inform', data);
	}
};

module.exports = RoomController;
