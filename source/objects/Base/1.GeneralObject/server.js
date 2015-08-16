/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*	 GeneralObject server component
*
*/

"use strict";

// The server side defintion of the object extends the common parts

var theObject=Object.create(require('./common.js'));

// The Modules variable provides access to server modules such as
// Module.ObjectManager

var Modules=require('../../../server.js');
var _ = require('lodash');
var async = require("async");

// Make the object public
module.exports=theObject;


// ****************************************************************
// * MAKE SENSITIVE ***********************************************
// ****************************************************************

theObject.makeSensitive=function(){
	this.isSensitiveFlag=true;
	
	var theObject=this;
	
	this.onObjectMove=function(changeData){
	
		//complete data
		
		var oldData={};
		var newData={};
		var fields=['x','y','width','height'];
		
		for (var i=0;i<4;i++){
			var field=fields[i];
			oldData[field]=changeData['old'][field] || this.getAttribute(field);
			newData[field]=changeData['new'][field] || this.getAttribute(field);
		}
		
		var that=this;
		
		this.getRoomAsync(function(){
			//error
		}, function(room){
			room.getInventoryAsync(function(inventory){
				for (var i in inventory){
			
					var object=inventory[i];
					
					if(object.id==that.id) continue;
					
					var bbox=object.getBoundingBox();
					
					//determine intersections
				
					var oldIntersects=that.bBoxIntersects(oldData.x,oldData.y,oldData.width,oldData.height,bbox.x,bbox.y,bbox.width,bbox.height);
					var newIntersects=that.bBoxIntersects(newData.x,newData.y,newData.width,newData.height,bbox.x,bbox.y,bbox.width,bbox.height);
					
					//handle move
					
					if (oldIntersects && newIntersects)  that.onMoveWithin(object,newData);
					if (!oldIntersects && !newIntersects)  that.onMoveOutside(object,newData);
					if (oldIntersects && !newIntersects)  that.onLeave(object,newData);
					if (!oldIntersects && newIntersects)  that.onEnter(object,newData);
				}
			});
		})
	}
	
	
	theObject.bBoxIntersects=function(thisX,thisY,thisWidth,thisHeight,otherX,otherY,otherWidth,otherHeight){
		
		if ((otherX+otherWidth)<thisX) {
			//console.log('too far left');
			return false;
		}
		if ((otherY+otherHeight)<thisY) {
			//console.log('too far up');
			return false;
		}
		if (otherX>(thisX+thisWidth)) {
			//console.log('too far right');
			return false;
		}
		if (otherY>(thisY+thisHeight)) {
			//console.log('too far bottom');
			return false;
		}
		
		//console.log('intersects');
		return true;	
		
	}
	
	
	/**
	*	intersects
	*
	*	determines, if this Active object intersects another object.
	*	In this simple implementation, this is done by bounding box comparison.
	**/
	theObject.intersects=function(otherX,otherY,otherWidth,otherHeight){
		
		if (typeof otherX == 'object'){
			var other=otherX.getBoundingBox();
			otherX=other.x;
			otherY=other.y;
			otherWidth=other.width;
			otherHeight=other.height;
		}
		
		var bbox=this.getBoundingBox();
		
		return this.bBoxIntersects(bbox.x,bbox.y,bbox.width,bbox.height,otherX,otherY,otherWidth,otherHeight);
		
	}
	
	
	/**
	*	getOverlappingObjectsAsync
	*
	*	get an array of all overlapping objects
	**/
	theObject.getOverlappingObjectsAsync=function(callback){
		
		this.getRoomAsync(function(){
			//error
		}, function(room){
			if (!room) return;
			room.getInventoryAsync(function(inventory){
			
				var result=[];
			
				for (var i in inventory){
		
					var test=inventory[i];
					if (test.id==this.id) continue;
					if (this.intersects(test)){
						result.push(test);
					}
				}
			
				callback(result);
			});
		});
	}
	
	
	/**
	*	getOverlappingObjects
	*
	*	get an array of all overlapping objects
	**/
	theObject.getOverlappingObjects=function(){
		
		console.log('>>>> Synchronous getOverlappingObjects in GeneralObject');
		
		var result=[];
		
		var inventory=this.getRoom().getInventory();
	
		for (var i in inventory){
			var test=inventory[i];
			if (test.id==this.id) continue;
			if (this.intersects(test)){
				result.push(test);
			}
		}
		
		return result;
	
	}
	
	
	/**
	*	SensitiveObjects evaluate other objects in respect to themselves.
	*
	*	object the object that shall be evaluated
	*	changeData old and new values of positioning (e.g. changeData.old.x) 
	**/
	theObject.evaluateObject=function(object,changeData){
		
		//complete data
		
		var oldData={};
		var newData={};
		var fields=['x','y','width','height'];
		
		for (var i=0;i<4;i++){
			var field=fields[i];
			oldData[field]=changeData['old'][field] || object.getAttribute(field);
			newData[field]=changeData['new'][field] || object.getAttribute(field);
		}
		
		//determine intersections
		
		var oldIntersects=this.intersects(oldData.x,oldData.y,oldData.width,oldData.height);
		var newIntersects=this.intersects(newData.x,newData.y,newData.width,newData.height);
		
		//handle move
		
		if (oldIntersects && newIntersects) return this.onMoveWithin(object,newData);
		if (!oldIntersects && !newIntersects) return this.onMoveOutside(object,newData);
		if (oldIntersects && !newIntersects) return this.onLeave(object,newData);
		if (!oldIntersects && newIntersects) return this.onEnter(object,newData);
	}
	
	if (!theObject.onMoveWithin) theObject.onMoveWithin=function(object,data){
		this.fireEvent('object::'+this.id+'::moveWithin',object.id);
	};
	
	if (!theObject.onMoveOutside) theObject.onMoveOutside=function(object,data){
		this.fireEvent('object::'+this.id+'::moveOutside',object.id);
	};
	
	if (!theObject.onLeave) theObject.onLeave=function(object,data){
		this.fireEvent('object::'+this.id+'::leave',object.id);
	};
	
	if (!theObject.onEnter) theObject.onEnter=function(object,data){
		this.fireEvent('object::'+this.id+'::enter',object.id);
	};
	
	if (!theObject.onDrop) theObject.onDrop=function(objectId,data){
		
		this.fireEvent('object::'+this.id+'::drop',objectId);
	};

	theObject.onDrop.public=true;

}


// ****************************************************************
// * MAKE STRUCTURING *********************************************
// ****************************************************************

theObject.makeStructuring=function(){
	this.isStructuringFlag=true;
	this.makeSensitive();
	this.isSensitiveFlag=false;
	
	this.onObjectMove=function(changeData){
		
		//when a structuring object is moved, every active object may be in need of repositioning
		
		console.log('onObjectMove on structuring object '+this);
		
		//this.getRoom().placeActiveObjects();
		this.getRoomAsync(function(){
			//error
		}, function(room){
			if(!room) return;
			room.placeActiveObjectsAsync();
		});
	}
	
	if (!this.getPositioningDataFor) this.getPositioningDataFor=function(activeObject){
		
		var result={reference:'ignore'};
		
		//reference: must, mustnot, ignore
		//minX
		//maxX
		//minY
		//maxY
		
		return result;
		
	}

}



/**
*	getAttributeSet
*
*	all of the objects Attributes as key,value pairs.
*	This may be different from actual object data
*	as evaluations may be involved
*/
theObject.getAttributeSet = function() {
	return Modules.AttributeManager.getAttributeSet(this);
}

/**
 *	persist
 *
 *	call this whenever an object has changed. It is saved
 *	through the current connector, the evaluation is called
 *	and a message is sent to the clients
 *
 */
theObject.persist = function() {
    var data = this.get();
    if (data) {
        Modules.Connector.saveObjectData(this.inRoom, this.id, data, this.context, false, undefined);
        this.updateClients();
    }
}

/**
*	updateClient
*
*	send a message to a client (identified by its socket)
*/
theObject.updateClient = function(socket, mode) {
	if (!mode) mode = 'objectUpdate';
	var object = this.getAttributeSet();

	process.nextTick(function() {
        var userId = socket.handshake.session.passport ? socket.handshake.session.passport.user : socket.deviceID;
        var resource = Modules.ACLManager.makeACLName(object.id, object.type);

        Modules.ACLManager.isAllowed(userId, resource, "show", function(err, allowed) {
           if (allowed) {
               var SocketServer = Modules.SocketServer;
                SocketServer.sendToSocket(socket, mode, object);
           } else {
               //console.info("++ updateClient:: userId: " + userId + " is not allowed to show resource: " + resource);
           }
        });
	});
}

/**
*	updateClients
*
*	send an upadate message to all clients which are subscribed
*	to the object's room
*/
theObject.updateClients = function(mode) {
	if (!mode) mode = 'objectUpdate';
	
	var connections = Modules.UserManager.getConnectionsForRoom(this.inRoom);

	for (var i in connections) {
		this.updateClient(connections[i].socket, mode);
	}
}

/**
*	hasContent
*
*	determines, if the object has content or not
*/
theObject.hasContent = function() {
	return this.getAttribute('hasContent');
}

/**
*	setContent
*
*	set a new content. If the content is base64 encoded png data,
*	it is decoded first.
*/
theObject.setContent = function(content, callback) {
	
	//console.log(content);
	
	if ((typeof content) != "object" && content.substr(0,22 )== 'data:image/png;base64,') {
		
		var base64Data = content.replace(/^data:image\/png;base64,/,""),
		content = new Buffer(base64Data, 'base64');
	}

	Modules.Connector.saveContent(this.inRoom, this.id, content, this.context, false, callback);
	
	this.set('hasContent',!!content);
	this.set('contentAge',new Date().getTime());

	//send object update to all listeners
	this.persist();
	this.updateClients('contentUpdate');
}

theObject.setContent.public = true;

theObject.setContent.neededRights = {
    write : true
}

theObject.copyContentFromFile=function(filename,callback) {

	Modules.Connector.copyContentFromFile(this.inRoom, this.id, filename, this.context, callback);
	
	this.set('hasContent',true);
	this.set('contentAge',new Date().getTime());

	//send object update to all listeners
	this.persist();
	this.updateClients('contentUpdate');
	
}

theObject.getCurrentUserName=function(){
	if (!this.context) return 'root';
	return this.context.user.username;
}

/**
*	getContent
*
*	get the object's content
*/
theObject.getContent=function(callback){
	if (!this.context) throw new Error('Missing context in GeneralObject.getContent');
	
	if(_.isFunction(callback)) {
    	Modules.Connector.getContent(this.inRoom, this.id, this.context,callback);
    }
    else {
		console.log('>>>> Synchronous getContent in GeneralObject');
		var content=Modules.Connector.getContent(this.inRoom, this.id, this.context);
		return content;
    }
}

theObject.getContent.public = true;

theObject.getContent.neededRights = {
    read : true
}

theObject.getContentAsString=function(callback){
	if (callback === undefined) {
		console.log('>>>> Synchronous getContentAsString in GeneralObject');
		return GeneralObject.utf8.parse(this.getContent());
	} else {
		this.getContent(function(content){
			callback(GeneralObject.utf8.parse(content));
		});
	}
}

theObject.getContentFromApplication = function(applicationName, callback){
    var eventName = "applicationevent::" + applicationName + "::getContent"
    var event = {
        objectID : this.getID(),
        callback : callback
    }
    Modules.EventBus.emit(eventName, event);
}

/**
*	getInlinePreview
*
*	get the object's inline preview
*/
theObject.getInlinePreview=function(mimeType, callback){
	return Modules.Connector.getInlinePreview(this.inRoom, this.id, mimeType, this.context, callback);
}

theObject.getInlinePreviewMimeType=function(callback) {
	Modules.Connector.getInlinePreviewMimeType(this.inRoom, this.id, this.context, callback);
}


theObject.evaluatePosition=function(key,value,oldvalue){

	if (this.runtimeData.evaluatePositionData===undefined) {
		this.runtimeData.evaluatePositionData={};
		this.runtimeData.evaluatePositionData.old={};
		this.runtimeData.evaluatePositionData.new={};
	}
	
	if (this.runtimeData.evaluatePositionData.delay) {
		clearTimeout(this.runtimeData.evaluatePositionData.delay);
		this.runtimeData.evaluatePositionData.delay=false;
	}
	
	this.runtimeData.evaluatePositionData['new'][key]=value;
	if (!this.runtimeData.evaluatePositionData['old'][key]) {
		this.runtimeData.evaluatePositionData['old'][key]=oldvalue;
		//if there yet is a value here, we have concurrent modifications
	}
	
	var posData=this.runtimeData.evaluatePositionData;
	var self=this;
	
	//Within this time, we collect data for evaluation. This is important
	//as often data that logically belongs together is sent seperately
	
	var timerLength=200;
	
	this.runtimeData.evaluatePositionData.delay=setTimeout(function(){
		
		var data={};
		data.old=posData.old;
		data.new=posData.new;
		
		self.evaluatePositionInt(data);
		self.runtimeData.evaluatePositionData=undefined;
	},timerLength);
	
}

theObject.evaluatePositionInt=function(data){
	
	var that=this;

	this.getRoomAsync(function(){
		//error
	},function(room){
		if (!room) return;
		room.evaluatePositionFor(that,data);
	});
	
}


theObject.getRoom=function(callback){
	
	console.log('>>>> Synchronous getRoom in GeneralObject');
	
	if (!this.context) return;
	
	//search the room in the context and return the room this object is in
	
	for (var index in this.context.rooms){
		var test=this.context.rooms[index];
		if (test && test.hasObject && test.hasObject(this)) {
			return test;
		}
	}
	
	return false;
}


theObject.getRoomAsync=function(error,cb){
	if (!this.context) error();
	
	//search the room in the context and return the room this object is in
	
	for (var index in this.context.rooms){
		var test=this.context.rooms[index];
		if (test && test.hasObjectAsync) {
			test.hasObjectAsync(this,function(){
				cb(test);
			});
		}
	}
	
	error();
}


theObject.getBoundingBox=function(){
	
	var x=this.getAttribute('x');
	var y=this.getAttribute('y');
	var width=this.getAttribute('width');
	var height=this.getAttribute('height');
	return {'x':x,'y':y,'width':width,'height':height};
	
}

theObject.fireEvent=function(name,data){
	
	//console.log('event fired',name,data);
	
	if (!data) {
		console.log('#### NO DATA');
		return;
	}
	
    data.context = this.context;

	Modules.EventBus.emit(name, data);
}

theObject.fireEvent.public=true; //Function can be accessed by customObjectFunctionCall


theObject.getLinkedObjectsAsync=function(callback) {
	
	var self = this;
	
	var getObject = function(id) {
		return Modules.ObjectManager.getObject(self.get('inRoom'), id, self.context);
	}
	
	var linkedObjects = this.getAttribute('link');
	
	var links = {};
		
	for(var i = 0; i<linkedObjects.length; i++){
			
		var targetID = linkedObjects[i].destination;
		var target = getObject(targetID);

		links[targetID] = {
			object : target,
		}
	}
	
	callback(links);
	
}


theObject.getLinkedObjects=function() {
	
	console.log('>>>> Synchronous GETLINKEDOBJECTS');
	
	var self = this;
	
	var getObject = function(id) {
		return Modules.ObjectManager.getObject(self.get('inRoom'), id, self.context);
	}
	
	var linkedObjects = this.getAttribute('link');
	
	var links = {};
		
	for(var i = 0; i<linkedObjects.length; i++){
			
		var targetID = linkedObjects[i].destination;
		var target = getObject(targetID);

		links[targetID] = {
			object : target,
		}
	}

	return links;
}

theObject.getObjectsToDuplicateAsync = function(list,callback) {
	
	if (list == undefined) {
		/* init new list */
		
		/* list of objects which will be duplicated */
		var list = {};
		
	}	

	this.getLinkedObjectsAsync(function(linkedObjects){
		
		var temp=[];
		
		for (var id in linkedObjects) {
			var target = linkedObjects[id];
			var targetObject = target.object;
			
			if (targetObject && !list[targetObject.get('id')]) {
				temp.push(targetObject.getObjectsToDuplicateAsync);
			}
		}
		
		temp.push=function(list,callback){
			list[self.getAttribute('id')] = true; //add this object to list
		}
		
		async.applyEachSeries(temp, list, function(){
			var arrList = [];
	
			for (var objectId in list) {
				arrList.push(objectId);
			}
			
			callback(arrList);
		});
		
	});
	
}


theObject.getObjectsToDuplicate = function(list) {
	
	console.log('>>>> Synchronous GETOBJECTSTODUPLICATE');
	
	var self = this;
	
	if (list == undefined) {
		/* init new list */
		
		/* list of objects which will be duplicated */
		var list = {};
		
	}
	
	list[self.getAttribute('id')] = true; //add this object to list
	
	var linkedObjects = this.getLinkedObjects();

	for (var id in linkedObjects) {
		var target = linkedObjects[id];
		var targetObject = target.object;
		
		if (targetObject && !list[targetObject.get('id')]) {
			targetObject.getObjectsToDuplicate(list);
		}
		
	}

	var arrList = [];
	
	for (var objectId in list) {

		arrList.push(objectId);
		
	}
	
	return arrList;
	
}


/**
*	returns the hierachy of rooms and objects (special format for JSTree!)
*   
*   data.id == -1: return the root rooms
*   data.id == roomid: return the inventory of this room
*/
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
    } 
	else{
        Modules.Connector.mayEnter(roomId, this.context, function(err, mayEnter) {
            if (mayEnter) {
                // get inventory of room with roomId
                var room = Modules.ObjectManager.getObject(roomId, roomId, self.context);
            	//var inventory = room.getInventory();
				room.getInventoryAsync(function(inventory){
				
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

										//var subInventory = object.getInventory();
										object.getInventoryAsync(function(subInventory){
										
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
											returnResults();
										});
									}
									else{
										returnResults();
									}
								}
								else{
									returnResults();
								}
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
				});
            } else {
				callback(result);
			}
        });
    }
}


theObject.browse.public = true;


/**
*	used by the browse-function (if objects should not be displayed, filter them)
*/
theObject.filterObject = function(obj) {
    if (this.getAttribute("filterObjects")) {
        if (obj.type != "Subroom") {
            return true;
        } else return false;
    } else return false;
}


/**
*	returns the inventory of the given room (special format for JSTree!)
*/
theObject.getRoomInventory = function(room, cb){

    Modules.ObjectManager.getObjects(room.id, this.context, function(objects){
		
		var objectArray = new Array();
		
		for(var i = 0; i<objects.length; i++){
		
			var id = objects[i].getAttribute('id');
			var type = objects[i].getAttribute('type');
			var name = objects[i].getAttribute('name');
			var inRoom = objects[i].getAttribute('inRoom');
			
			var node = {
				data : {
					title : name,
					icon : '/objectIcons/'+type
				},
				metadata : {
					id : id,
					name : name,
					type : type,
					inRoom : inRoom
				}
			}
			objectArray.push(node);
		}
		cb(objectArray);
	});
}

theObject.getRoomInventory.public = true;