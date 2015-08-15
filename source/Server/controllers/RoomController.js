/**
 * Contains room related tasks
 */

var async = require('async');
var lodash = require('lodash');
var _ = require('underscore');

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

//TODO: should be implemented on Connector lvl. because it may be different
RoomController.createRoom = function (data, context, callback) {

    var roomID = data.roomID;

    var obj = {};
    obj.id = roomID;
    obj.name = roomID;

    //create callback with first parameter always null (otherwise would throw
    //error
    var cb = lodash.partial(callback, null);

    Modules.Connector.saveObjectData(roomID, roomID, obj, context, true, cb)

}

//TODO: should be implemented on Connector lvl. because it may be different
RoomController.roomExists = function (data, context, callback) {
    var roomID = data.roomID;
    var obj= Modules.Connector.getObjectDataByFile(roomID,roomID);

    callback(null, !!obj);
}

RoomController.duplicateRoom = function (data, context, callback) {
    var roomID = data.fromRoom;
    var newRoomID = data.toRoom;
    var parent = data.parentRoom;
    var roomName = data.roomName;

    //TODO: it is really ugly that getRoomData is used to create a room
    //If parent is set.
    //Create subroom item in parent.
    if (parent) {
        Modules.Connector.getRoomData(newRoomID, context, parent, undefined); //TODO: set parent if necessary
        //TODO add subroom object to parent

        //Subroom item
        var subRoomItemData = {
            roomID: parent,
            type: "Subroom",
            attributes: {
                name: roomName || newRoomID,
                destination: newRoomID
            }
        }
    } else {
        Modules.Connector.getRoomData(newRoomID, context, false, undefined); //TODO: set parent if necessary
    }

    var requestData = {
        objects: "ALL",
        fromRoom: roomID,
        toRoom: newRoomID
    };
    Modules.ObjectManager.duplicateNew(requestData, context, callback);
}

//TODO: remove? combine with "browse" of exit object
RoomController.listRooms = function (callback) {
    Modules.Connector.listRooms(callback)
}

// Information are sent to all clients in the same room
RoomController.informAllInRoom = function (data, cb) {
    var connections = Modules.UserManager.getConnectionsForRoom(data.room);

    var connectionsList = [];
    _.each(connections, function (value, key, list) {
        if (data.passport.user != value.socket.handshake.session.passport.user) {
            connectionsList.push(value.socket);
        }
    });

    async.each(connectionsList, function (socket, callback) {
        // Inform only the clients who have permissions over the resource
        var resourceID = data.message.selection ? data.message.selection : data.message.deselection;

        var userId = socket.handshake.session.passport.user;
        var resource = Modules.ACLManager.makeACLName(resourceID);

        Modules.ACLManager.isAllowed(userId, resource, "show", function(err, allowed) {
            if (!err && allowed) {
                Modules.SocketServer.sendToSocket(socket, 'inform', data);
            } else {
               //console.info("++ informAllInRoom:: userId: " + userId + " is not allowed to show resource: " + resource);
            }

            callback(err);
        });
    }, function (err) {
        if (err) console.error(err.message);

        cb(null, 'OK');
    });
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

