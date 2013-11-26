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
	var parent = data.parentRoom ;

	//TODO: it is really ugly that getRoomData is used to create a room
	if(parent){
		Modules.Connector.getRoomData(newRoomID, context, undefined, parent); //TODO: set parent if necessary
		//TODO add subroom object to parent

		//Subroom item
		var subRoomItemData = {
			roomID : parent,
			type : "Subroom",
			attributes : {
				name : newRoomID,
				destination : newRoomID
			}
		}

		//TODO: callback
		this.createObject(subRoomItemData, context, function(){
			console.log("Created item....");
		});
	} else {
		Modules.Connector.getRoomData(newRoomID, context, undefined); //TODO: set parent if necessary
	}

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

//TODO: remove? combine with "browse" of exit object
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

