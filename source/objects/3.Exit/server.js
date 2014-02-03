/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
var _ = require('lodash');

module.exports=theObject;

theObject.browse = function(data, callback) {
	var roomId = data.id;
	var result = [];
    var self = this;

    var createSubroomNode = function(){
        var args = arguments[0];
        var defaults = {
            'icon' : "/objectIcons/Subroom",
            'name' : args["title"],
            'type' : "Room"
        }
        args = _.defaults(args, defaults)

        return createNode(args);
    }

    var createNode = function(){
        var node = {};
        var args = arguments[0];
        var defaults = {
            icon : "/objectIcons/" + args.type
        }
        args = _.defaults(args, defaults);

        node.data = {
            "title" : args.title,
            "icon" : args.icon
        };

        node.metadata = {
            "id" : args.id,
            "name" : args.name,
            "type" : args.type
        };

        if(args.inRoom){
            node.metadata["inRoom"] = args.inRoom;
        }

        return node;
    }

    if (roomId === -1) {
    	// get root rooms
        Modules.Connector.getRoomHierarchy(roomId, this.context, function(hierarchy) {
            for (var key in hierarchy.roots) {
                var node = createSubroomNode({
                    id : hierarchy.roots[key],
                    title : hierarchy.rooms[hierarchy.roots[key]]
                });
                if (hierarchy.relation[hierarchy.roots[key]] != undefined) {
                    node.state = "closed";
                }
                result.push(node);
            }

            callback(result);
        });
    } else {
        Modules.Connector.mayEnter(roomId, this.context, function(err, mayEnter) {
            if (mayEnter) {
                // get inventory of room with roomId
                var room = Modules.ObjectManager.getObject(roomId, roomId, self.context);
            	var inventory = room.getInventory();

                var resultCounter = 0;
                var returnResults = function() {
                    resultCounter++;
                    if (resultCounter === inventory.length) {
                        callback(result);
                    }
                }

            	for (var key in inventory) {
            		var node = {};

                    if (self.filterObject(inventory[key])) {
                        returnResults();
                        continue;
                    }

                    if (inventory[key].getAttribute("type") === "Subroom" && inventory[key].getAttribute("destination") !== undefined) {
                        Modules.Connector.mayEnter(inventory[key].getAttribute("destination"), self.context, function(err, mayEnter) {
                            if (mayEnter) {
                                var object = Modules.ObjectManager.getObject(inventory[key].getAttribute("destination"), inventory[key].getAttribute("destination"), self.context);

                                if (object) {
                                    node = createSubroomNode({
                                        id : object.getAttribute("id"),
                                        title: object.getAttribute("name")
                                    });

                		            var subInventory = object.getInventory();
                                    for (var subKey in subInventory) {
                                        if (self.filterObject(subInventory[subKey])) {
                                            continue;
                                        } else {
                                            // subroom: check if room object exists
                                            if (subInventory[subKey].type === "Subroom") {
                                                if (subInventory[subKey].getAttribute("destination") !== undefined) {
                                                    var subObject = Modules.ObjectManager.getObject(subInventory[subKey].getAttribute("destination"), subInventory[subKey].getAttribute("destination"), self.context);
                                                    if (subObject) {
                                                        node.state = "closed";
                                                        break;
                                                    }
                                                }
                                            } else {
                                                node.state = "closed";
                                                break;
                                            }
                                        }
                                    }
                                    result.push(node);
                                }
                            }
                            returnResults();
                        });
                    } else {
                        node = createNode({
                            "title" : "" + inventory[key].getAttribute("name"),
                            "id" : "" + inventory[key].getAttribute("id"),
                            "name" : "" + inventory[key].getAttribute("name"),
                            "type" : "" + inventory[key].getAttribute("type"),
                            "inRoom" : "" + inventory[key].getAttribute("inRoom")
                        })

                        result.push(node);
                        returnResults();
                    }
            	}
            } else callback(result);
        });
    }
}

theObject.filterObject = function(obj) {
    if (this.getAttribute("filterObjects")) {
        if (obj.type != "Subroom") {
            return true;
        } else return false;
    } else return false;
}

theObject.browse.public = true;