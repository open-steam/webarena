/**
 * Contains room related tasks
 */
var _ = require('lodash');

var RoomController = {}

var Modules = false;


RoomController.init = function (theModules) {
    Modules = theModules;
}

RoomController.getCommunicationChannel = function(data, context, callback){
    var from = data.from;
    var to = data.to;

    var roomName = "communication_" + from + "_" + to;

    var cb = function(){
        callback(null, roomName)
    }

    Modules.Connector.getRoomData(roomName, context, false, cb);
}

//TODO: createRoom should exist on the connector level as object creation may be different
RoomController.createRoom = function (data, context, callback) {

    var roomID = data.roomID;

    var obj = {};
    obj.id = roomID;
    obj.name = roomID;

    //create callback with first parameter always null (otherwise would throw
    //error
    var cb = _.partial(callback, null);

    Modules.Connector.saveObjectData(roomID, roomID, obj, context, true, cb)

}



//TODO: remove? combine with "browse" of exit object
RoomController.listRooms = function (callback) {
    Modules.Connector.listRooms(callback)
}

//Information are sent to all clients in the same room
RoomController.informAllInRoom = function (data, callback) {

    var connections = Modules.UserManager.getConnectionsForRoom(data.room);

    for (var i in connections) {
        var socket = connections[i].socket;
        Modules.SocketServer.sendToSocket(socket, 'inform', data);
    }
};

/**
 *    sendRoom
 *
 *    sends a rooms content to a client (given by its socket)
 * TODO: there should be no socket! We are inside of a controller
 *
 */
RoomController.sendRoom = function (socket, roomID) {
    var context = Modules.UserManager.getConnectionBySocket(socket);

    Modules.ObjectManager.getRoom(roomID, context, false, function (room) { //the room object

        room.updateClient(socket);				//and send it to the client

        Modules.ObjectManager.getInventory(roomID, context, function (objects) {
            for (var i in objects) {
                var object = objects[i];
                object.updateClient(socket, 'objectUpdate');	//the object data
                if (object.hasContent()) {		//and its content if there is some
                    object.updateClient(socket, 'contentUpdate', object.hasContent(socket));
                }
            }

        });

    });

}


module.exports = RoomController;

