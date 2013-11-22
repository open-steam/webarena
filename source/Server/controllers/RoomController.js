/**
 * Contains room related tasks
 */

var RoomController = {}

var Modules = false;

RoomController.init = function(theModules){
	Modules = theModules;
}

RoomController.duplicateRoom = function(data, context, callback){
	var roomID = data.fromRoom;
    var newRoomID = data.toRoom;

	//TODO: it is really ugly that getRoomData is used to create a room
	var newRoom = Modules.Connector.getRoomData(newRoomID, context, undefined, "public"); //TODO: don't use public as parent

	var requestData = {
		objects : "ALL",
		fromRoom : roomID,
		toRoom : newRoomID
	};
	Modules.ObjectManager.duplicateNew(requestData, context, callback);
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

/**
 *	sendRoom
 *
 *	sends a rooms content to a client (given by its socket)
 * TODO: there should be no socket! We are inside of a controller
 *
 */
RoomController.sendRoom=function(socket, roomID, index){
	var context=Modules.UserManager.getConnectionBySocket(socket);

	Modules.ObjectManager.getRoom(roomID, context, function(room) { //the room object

		room.updateClient(socket);				//and send it to the client

		Modules.ObjectManager.getInventory(roomID, context, function(objects) {
			for (var i in objects){
				var object = objects[i];
				object.context.room = object.context.rooms[index];
				object.updateClient(socket, 'objectUpdate');	//the object data
				if (object.hasContent()) {		//and its content if there is some
					object.updateClient(socket, 'contentUpdate', object.hasContent(socket));
				}
			}
		});
	});
}

module.exports = RoomController;

