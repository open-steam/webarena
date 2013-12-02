/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');

module.exports=theObject;

theObject.browse = function(data, callback) {
	var roomId = data.id;
	var result = [];
    var self = this;

    if (roomId === -1) {
    	// get root rooms
        Modules.Connector.getRoomHierarchy(roomId, this.context, function(hierarchy) {
            for (var key in hierarchy.roots) {
                var node = {};
                node.data = { 
                    "title" : hierarchy.rooms[hierarchy.roots[key]],
                    "icon" : "/objectIcons/Subroom"
                };
                node.metadata = { 
                    "id" : ''+hierarchy.roots[key], 
                    "name" : ''+hierarchy.rooms[hierarchy.roots[key]],
                    "type" : "Room",
                };
                if (hierarchy.relation[hierarchy.roots[key]] != undefined) {
                    node.state = "closed";
                }
                result.push(node);
            }

            callback(result);
        });
    } else {
        Modules.Connector.mayEnter(roomId, this.context, function(mayEnter) {
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
                        Modules.Connector.mayEnter(inventory[key].getAttribute("destination"), self.context, function(mayEnter) {
                            if (mayEnter) {
                                var object = Modules.ObjectManager.getObject(inventory[key].getAttribute("destination"), inventory[key].getAttribute("destination"), self.context);

                                if (object) {
                	            	node.data = {
                                        "title" : "" + object.getAttribute("name"),
                                        "icon" : "/objectIcons/Subroom"
                                    };
                		            node.metadata = { 
                		            	"id" : "" + object.getAttribute("id"), 
                		            	"name" : "" + object.getAttribute("name"),
                		            	"type" : "Room"
                		            };

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
                    	node.data = {
                            "title" : "" + inventory[key].getAttribute("name"),
                            "icon" : "/objectIcons/" + inventory[key].getAttribute("type")
                        };
        	            node.metadata = { 
        	            	"id" : "" + inventory[key].getAttribute("id"), 
        	            	"name" : "" + inventory[key].getAttribute("name"),
        	            	"type" : "" + inventory[key].getAttribute("type"),
        	            	"inRoom" : "" + inventory[key].getAttribute("inRoom")
        	            };
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