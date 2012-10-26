/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


"use strict";


var CacheManager={};
var Modules = false;

CacheManager.cache = {
	"rooms" : {
		
	},
	"users" : {
		
	}
}

CacheManager.cache_test = {
	"rooms" : {
		"public" : {
			"objects" : {
				"940849032" : {
					"objectData" : {
						"attributes" : {
							"id" : 940849032,
							"name" : "Felix",
							"x" : 20,
							"y" : 40
						},
						"type" : "xxx",
						//... (as provided by connector)
					},
					"content" : ""
				}
			},
			"roomData" : {
				"id" : 49320324
			}
		}
	},
	"users" : {
		"tobi" : {
			"rights" : {
				"public" : {
					"objects" : {
						"32787193" : {
							"read" : true,
							"write" : true,
							"evaluate" : true,
							"delete" : true,
						},
						//...
					},
					"room" : {
						"read" : true, //TODO: needed?
						"write" : true, //TODO: needed?
						"evaluate" : true, //TODO: needed?
						"delete" : true, //TODO: needed?
						"create" : {
							"drawing" : false,
							"ellipse" : true
						},
						"enter" : true
					}
				},
				//...
			},
			"userData" : {
				//...
			}
		}
	}
};

CacheManager.init=function(theModules){
	Modules=theModules;
	
	Modules.config.connector.init(theModules);
	
}


CacheManager.getCacheUser=function(context) {
	
	if (context === true) {
 		return "root";
	} else {
		return context.user.username;
	}
	
}



CacheManager.login=function(username,password,rp,context){
	
	Modules.Log.debug("Login request for user '"+username+"'");
	
	Modules.config.connector.login(username,password,function(data) {
		
		if (data) {
			/* login successfull */
			Modules.Log.debug("Login successfull for user '"+username+"'");
			
			/* create cache structure for user */
			CacheManager.cache["users"][username] = {
				"rights" : {

				},
				"userData" : data,
				"context" : context
			};
			
		} else Modules.Log.debug("Login failed for user '"+username+"'");
		
		rp(data);
		
	}); //login
	
}

/**
*	 RIGHTS
*/


CacheManager.mayRead=function(roomID,objectID,context){
	
	if (roomID=='undefined') trace();
	
	Modules.Log.debug("Check right 'read' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (roomID==objectID) {
		//room
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["read"];
	} else {
		//object
		
		if (!CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]) {
			console.error('Object not found in CacheManager.mayRead');
			//TODO There seeems to be a timing problem here or object not in cache at all?
			return true;
		}
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]["read"];
	}
}

CacheManager.mayWrite=function(roomID,objectID,context){
	Modules.Log.debug("Check right 'write' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (roomID==objectID) {
		//room
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["write"];
	} else {
		//object
		
		if (!CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]) {
			console.error('Object not found in CacheManager.mayRead');
			//TODO There seeems to be a timing problem here or object not in cache at all?
			return true;
		}		
		
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]["write"];
	}
}

CacheManager.mayEvaluate=function(roomID,objectID,context){
	Modules.Log.debug("Check right 'evaluate' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (roomID==objectID) {
		//room
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["evaluate"];
	} else {
		//object
		
		if (!CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]) {
			console.error('Object not found in CacheManager.mayRead');
			//TODO There seeems to be a timing problem here or object not in cache at all?
			return true;
		}
		
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]["evaluate"];
	}
}

CacheManager.mayDelete=function(roomID,objectID,context){
	Modules.Log.debug("Check right 'delete' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (roomID==objectID) {
		//room
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["delete"];
	} else {
		//object
		
		if (!CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]) {
			console.error('Object not found in CacheManager.mayRead');
			//TODO There seeems to be a timing problem here or object not in cache at all?
			return true;
		}		
		
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]["delete"];
	}
}


CacheManager.mayCreate=function(roomID,type,context){
	Modules.Log.debug("Check right 'create' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["create"][type] == undefined) {
		/* type not known */
		
		if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["create"]["unknown"] == undefined) {
			/* no default value for unknown types found */
			return false;
		} else {
			return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["create"]["unknown"];
		}
		
	} else {
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["create"][type];
	}
}

CacheManager.mayEnter=function(roomID,context,callback){
	Modules.Log.debug("Check right 'enter' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (callback == undefined) {
		/* sync. */
		
		if (context === true) return true; //root
		if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] && CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["enter"]) {
			return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["enter"];
		} else Modules.Log.error("Rights not cached for room (sync. access not possible) (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
	} else {
		/* async. */
		
		if (context === true) callback(true); //root
		if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] && CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["enter"]) {
			callback(CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["enter"]);
		} else {
			CacheManager.getInventory(roomID,context,function() {
				callback(CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["enter"]);
			});
		}
		
	}
	
}




/**
*	getInventory
*
*	returns all objects in a room (no actual objects, just their attributeset)
*
*/
CacheManager.getInventory=function(roomID,context,callback){
	Modules.Log.debug("Request inventory (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	if (roomID === undefined) Modules.Log.error("Missing roomID (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	if (CacheManager.cache["users"][CacheManager.getCacheUser(context)] == undefined) Modules.Log.error("User is not logged in (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	//this function is called when objects are loaded
	function objectsLoaded(roomID,context,callback) {

		Modules.Log.debug("Inventory objects are loaded (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

		//this function is called when rights are loaded
		function rightsLoaded(roomID,context,callback) {
			Modules.Log.debug("User rights are loaded (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			
			var inventory = [];

			for (var i in CacheManager.cache["rooms"][roomID]["objects"]) {
				inventory.push(CacheManager.cache["rooms"][roomID]["objects"][i]["objectData"]);
			}

			CacheManager.mayEnter(roomID, context, function(maySub) {
				if (maySub) {
					callback(inventory);
				} else Modules.Log.error("Missing rights to enter (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			});
			
		}
		
		if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] != undefined) {
			//user rights cached
			Modules.Log.debug("User rights are cached (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			rightsLoaded(roomID,context,callback);
		} else {
			Modules.Log.debug("User rights are not cached (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			//user rights not cached --> load user rights
			CacheManager.loadUserRights(roomID, context, function() {
				rightsLoaded(roomID,context,callback);
			});
		}
		
	}
	
	
	if (CacheManager.cache["rooms"][roomID] != undefined && CacheManager.cache["rooms"][roomID]["objects"] != undefined) {
		/* room with objects found in cache */
		
		Modules.Log.debug("Inventory is cached (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
		objectsLoaded(roomID,context,callback);
		
	} else {
		/* room not cached --> load room */
		Modules.Log.debug("Inventory is not cached (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
		CacheManager.loadRoom(roomID, function() {
			objectsLoaded(roomID,context,callback);
		});
		
	}
	
}


CacheManager.inventoryIsCached=function(roomID,context) {
	return (CacheManager.cache["rooms"][roomID] != undefined && CacheManager.cache["rooms"][roomID]["objects"] != undefined && CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] != undefined);
}

//sync
CacheManager.getCachedInventory = function(roomID, context) {
	Modules.Log.debug("Load cached inventory (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	var inventory = [];

	for (var i in CacheManager.cache["rooms"][roomID]["objects"]) {
		inventory.push(CacheManager.cache["rooms"][roomID]["objects"][i]["objectData"]);
	}

	if (!CacheManager.mayEnter(roomID, context)) Modules.Log.debug("Missing rights to enter (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	return inventory;
	
}


//internal
CacheManager.loadUserRights = function(roomID,context,callback) {
	Modules.Log.debug("Load user rights (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	var ids = [];
	
	for (var objId in CacheManager.cache["rooms"][roomID]["objects"]) {
		ids.push(objId);
	}
	
	//load object rights
	Modules.config.connector.getUserRightsForObjects(roomID, ids, context, function(objectRights) {
		
			CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] = {
				"objects" : {},
				"room" : {}
			};
		
			for (var id in objectRights) {
				
				CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][id] = objectRights[id];
			
			}
			
			//load room rights
			Modules.config.connector.getUserRightsForRoom(roomID, context, function(rights) {
			
				CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"] = rights;
			
				callback();
				
			});
			
	});
	
}

//internal
CacheManager.loadRoom = function(roomID,loadRoomCallback) {

	//load room data
	Modules.Log.debug("Load Room (roomID: '"+roomID+"')");
	
	CacheManager.cache["rooms"][roomID] = {
		"roomData" : {}
	};
	
	Modules.config.connector.withRoomData(roomID,true,function(roomData) {
		Modules.Log.debug("Room data loaded (roomID: '"+roomID+"')");
		
		CacheManager.cache["rooms"][roomID]["roomData"] = roomData;
	
		CacheManager.loadRoomObjects(roomID, loadRoomCallback); //load objects (inventory)
		
	});
	
}

//internal
CacheManager.loadRoomObjects = function(roomID,callback) {
	Modules.Log.debug("Load room objects (roomID: '"+roomID+"')");

		//load room objects
		
		Modules.config.connector.withInventory(roomID,true,function(data) {
			Modules.Log.debug("Got objects from connector (roomID: '"+roomID+"')");
			
			/* create cache structure for room objects */
			CacheManager.cache["rooms"][roomID]["objects"] = {
				
			};

			data.forEach(function(objData){
				
				var content = objData.content;
				
				if (({}).toString.call(objData.content).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == "string") {
					/* create byte array */
					
					var byteArray = [];
					var contentBuffer = new Buffer(content);
					
					for (var j = 0; j < contentBuffer.length; j++) {
						
						byteArray.push(contentBuffer.readUInt8(j));
						
					}
					
					content = byteArray;
					
				}
				
				CacheManager.cache["rooms"][roomID]["objects"][objData.attributes.id] = {
					"objectData" : objData.attributes,
					"content" : content
				};

			});

			callback();

		});
		
	
}


//internal
CacheManager.updateUserRights = function(roomID,callback) {
	Modules.Log.debug("Update cached rights for all users (roomID: '"+roomID+"')");
	
	function updateDone() {

		numberOfUpdatesDone++;
		
		if (numberOfUpdatesDone == numberOfUpdates) {
			Modules.Log.debug("All users updated (roomID: '"+roomID+"')");
			callback();
		}
		
	}
	
	var numberOfUpdates = 0;
	var numberOfUpdatesDone = 0;
	
	for (var i in CacheManager.cache.users) {
		var user = CacheManager.cache.users[i];
		
		numberOfUpdates++;
		
		if (user.rights[roomID] != undefined) {
			//update rights for user
			
			Modules.Log.debug("Updating cached user rights for user '"+user.userData.username+"' (roomID: '"+roomID+"')");
			
			CacheManager.loadUserRights(roomID,user.context,function() {
				updateDone();
			});
			
		}
		
	}
	
}

//internal
CacheManager.reloadRoomCache=function(roomID,callback) {
	Modules.Log.debug("Reload cached rooms (roomID: '"+roomID+"')");
	
	/* reload all objects in room with id roomID (including the new object) */
	CacheManager.loadRoomObjects(roomID,function() {
		/* room objects are loaded */
		
		/* update users rights */
		CacheManager.updateUserRights(roomID, function() {
			/* user rights are updated */
			
			callback();
			
		});
		
	});
	
}




/**
*	getRoomData
*
*	returns the attribute set of the current room
*
*/
CacheManager.getRoomData=function(roomID,context,callback){
	Modules.Log.debug("Get data for room (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!context) Modules.Log.error("Missing context");
	
	function roomLoaded(roomID,context,callback) {

		function rightsLoaded(roomID,context,callback) {
			if (!CacheManager.mayRead(roomID, roomID, context)) Modules.Log.error("Missing rights to read (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			callback(CacheManager.cache["rooms"][roomID]["roomData"]);
		}
		
		
		if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] != undefined) {
			//user rights cached
			rightsLoaded(roomID,context,callback);
		} else {
			//user rights not cached --> load user rights
			CacheManager.loadUserRights(roomID, context, function() {
				rightsLoaded(roomID,context,callback);
			});
		}
		
	}
	
	if (CacheManager.cache["rooms"][roomID] != undefined) {
		/* room loaded */
		
		roomLoaded(roomID,context,callback);
		
	} else {
		/* room not loaded --> load room */
		
		CacheManager.loadRoom(roomID, function() {
			roomLoaded(roomID,context,callback);
		});
		
	}
	
}

/**
*	save the object (by given data)
*
*	if an "after" function is specified, it is called after saving
*
*/
CacheManager.saveObjectData=function(roomID,objectID,data,after,context){
	Modules.Log.debug("Save object data (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayWrite(roomID, objectID, context)) Modules.Log.debug("Missing rights to write (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	if (roomID == objectID) {
		CacheManager.cache["rooms"][roomID]["roomData"]["attributes"] = data; //update object cache
	} else {
		CacheManager.cache["rooms"][roomID]["objects"][objectID]["objectData"]["attributes"] = data; //update object cache
	}
	
	Modules.config.connector.saveObjectData(roomID,objectID,data,after,context);
	
}

/**
*	save the object's content
*
*	if an "after" function is specified, it is called after saving
*
*/
CacheManager.saveContent=function(roomID,objectID,content,after,context){
	Modules.Log.debug("Save content from string (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayWrite(roomID, objectID, context)) Modules.Log.debug("Missing rights to write (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	if (({}).toString.call(content).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == "string") {
		/* create byte array */
		
		var byteArray = [];
		var contentBuffer = new Buffer(content);
		
		for (var j = 0; j < contentBuffer.length; j++) {
			
			byteArray.push(contentBuffer.readUInt8(j));
			
		}
		
		content = byteArray;
		
	}

	CacheManager.cache["rooms"][roomID]["objects"][objectID]["content"] = content;
	
	Modules.config.connector.saveContent(roomID,objectID,content,after,context);
	
}


/**
*	get the the object's content from a file and save it
*
*	if a callback function is specified, it is called after saving
*
*/
CacheManager.copyContentFromFile=function(roomID, objectID, sourceFilename, callback,context) {
	
	Modules.Log.debug("Copy content from file (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"', source: '"+sourceFilename+"')");
	
	if (!context) throw new Error('Missing context in CacheManager.copyContentFromFile');
	
	var fs = require('fs');
	
	var content = fs.readFileSync(sourceFilename);
	
	var byteArray = [];
	var contentBuffer = new Buffer(content);
	
	for (var j = 0; j < contentBuffer.length; j++) {
		
		byteArray.push(contentBuffer.readUInt8(j));
		
	}

	CacheManager.saveContent(roomID,objectID,byteArray,callback,context);

}

/**
*	getContent
*
*	get an object's content as an array of bytes
*	
*/
CacheManager.getContent=function(roomID,objectID,context,callback){
	
	Modules.Log.debug("Get content as String (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayRead(roomID, objectID, context)) Modules.Log.error("Missing rights to read (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (callback == undefined) {
		//sync

		return CacheManager.cache["rooms"][roomID]["objects"][objectID]["content"];
		
	} else {
		//async

		if (CacheManager.cache["rooms"][roomID]["objects"][objectID]["content"]) {

			callback(CacheManager.cache["rooms"][roomID]["objects"][objectID]["content"]);
		} else {

			Modules.config.connector.getContent(roomID,objectID,context, function(content) {


				if (({}).toString.call(content).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == "string") {
					/* create byte array */
					
					var byteArray = [];
					var contentBuffer = new Buffer(content);
					
					for (var j = 0; j < contentBuffer.length; j++) {
						
						byteArray.push(contentBuffer.readUInt8(j));
						
					}
					
					content = byteArray;
					
				}
				
				CacheManager.cache["rooms"][roomID]["objects"][objectID]["content"] = content;
				callback(content);
			});
			
		}
		
	}

}



/**
*	remove
*
*	remove an object from the persistence layer
*/
CacheManager.remove=function(roomID,objectID,context){
	
	Modules.Log.debug("Remove object (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayDelete(roomID, objectID, context)) Modules.Log.error("Missing rights to delete (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	delete CacheManager.cache["rooms"][roomID]["objects"][objectID]; //remove from cache
	
	Modules.config.connector.remove(roomID,objectID,context);
	
}

/**
*	createObject
*
*	create a new object on the persistence layer
*
*	to direcly work on the new object, specify a callback function
*
*	after(objectID)
*
*/
CacheManager.createObject=function(roomID,type,data,callback,context){

	Modules.Log.debug("Create object (roomID: '"+roomID+"', type: '"+type+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayCreate(roomID, type, context)) Modules.Log.error("Missing rights to create object (roomID: '"+roomID+"', type: '"+type+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	Modules.config.connector.createObject(roomID,type,data,function(newObjectId) {
		
		Modules.Log.debug("Object created (roomID: '"+roomID+"', objectID: '"+newObjectId+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
		CacheManager.reloadRoomCache(roomID, function() {
			callback(newObjectId);
		});
		
	},context);
	
}




/**
*	duplicateObject
*
*	duplicate an object on the persistence layer
*
*	to direcly work on the new object, specify an after function
*
*	after(objectID)
*
*/
CacheManager.duplicateObject=function(roomID,objectID,callback,context){
	
	Modules.Log.debug("Duplicate object (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	Modules.config.connector.duplicateObject(roomID,objectID,function(newObjectId, oldObjectId) {
		Modules.Log.debug("Object duplicated (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
		CacheManager.reloadRoomCache(roomID, function() {
			callback(newObjectId, oldObjectId);
		});
		
	},context);

}







/**
*	getObjectData
*
*	returns the attribute set of an object
*
*/
CacheManager.getObjectData=function(roomID,objectID,context){
	
	Modules.Log.debug("Get object data (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayRead(roomID, objectID, context)) Modules.Log.error("Missing rights to read (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	if (roomID == objectID) {
		/* room */
		try {
			var val = CacheManager.cache["rooms"][roomID]["roomData"];
		} catch(err) {
			var val = false;
		}
	} else {
		try {
			var val = CacheManager.cache["rooms"][roomID]["objects"][objectID]["objectData"];
		} catch(err) {
			var val = false;
		}
	}
	
	return val;
	
}





















CacheManager.trimImage=function(roomID, objectID, callback, context) {
	
	if (!context) throw new Error('Missing context in CacheManager.trimImage');

	/* save content to temp. file */

	var filename = __dirname+"/tmp/trim_"+roomID+"_"+objectID;

	CacheManager.getContent(roomID,objectID,context,function(content) {
		
		var fs = require('fs');

		fs.writeFile(filename, content, function (err) {
		 	if (err) throw err;
			/* temp. file saved */

			var im = require('imagemagick');

			//output: test.png PNG 192x154 812x481+226+131 8-bit DirectClass 0.010u 0:00.000
			im.convert([filename, '-trim', 'info:-'], function(err,out,err2) {

				if (!err) {

					var results = out.split(" ");

					var dimensions = results[2];
					var dimensionsA = dimensions.split("x");

					var newWidth = dimensionsA[0];
					var newHeight = dimensionsA[1];

					var d = results[3];
					var dA = d.split("+");

					var dX = dA[1];
					var dY = dA[2];

					im.convert([filename, '-trim', filename], function(err,out,err2) {

						if (!err) {

							//save new content:
							CacheManager.copyContentFromFile(roomID, objectID, filename, function() {
							
								//delete temp. file
								var fs = require('fs');
								fs.unlink(filename);
							
								callback(dX, dY, newWidth, newHeight);
								
							},context);
							
						} else {
							//TODO: delete temp. file
							Modules.Log.error("error while trimming "+roomID+"/"+objectID);
						}

					});

				} else {
					Modules.Log.error("error getting trim information of "+roomID+"/"+objectID);
				}

			});



		});
		
	});
	
	
	
};


CacheManager.isInlineDisplayable=function(mimeType) {
	
	if (this.getInlinePreviewProviderName(mimeType) == false) {
		return false;
	} else {
		return true;
	}
	
}

CacheManager.getMimeType=function(roomID,objectID,context,callback) {
	
	if (!context) throw new Error('Missing context in CacheManager.getMimeType');

	var objectData = CacheManager.getObjectData(roomID,objectID,context);
	var mimeType = objectData.attributes.mimeType;
	
	callback(mimeType);
	
}

//SYNC
CacheManager.getInlinePreviewProviderName=function(mimeType) {

	if (!mimeType) return false;

	if (this.getInlinePreviewProviders()[mimeType] != undefined) {
		return this.getInlinePreviewProviders()[mimeType];
	} else {
		return false;
	}
	
}

//SYNC
CacheManager.getInlinePreviewMimeTypes=function() {
	
	var mimeTypes = this.getInlinePreviewProviders();
	var list = {};
	
	for (var mimeType in mimeTypes){
		list[mimeType] = true;
	}
	
	return list;
	
}

//SYNC
CacheManager.getInlinePreviewProviders=function() {
	return {
		//"application/pdf" : "pdf",
		"image/jpeg" : "image",
		"image/jpg" : "image",
		"image/png" : "image",
		"image/gif" : "image"
	}
}

CacheManager.getInlinePreviewDimensions=function(roomID, objectID, callback, mimeType,context) {
	
	if (!context) throw new Error('Missing context in CacheManager.getInlinePreviewDimensions');
	
	function mimeTypeDetected(mimeType) {
		
		/* find provider for inline content: */
		var generatorName = CacheManager.getInlinePreviewProviderName(mimeType);

		if (generatorName == false) {
			Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
			callback(false, false); //do not set width and height (just send update to clients)
		} else {
			CacheManager.inlinePreviewProviders[generatorName].dimensions(roomID, objectID, callback, context);
		}
		
	}
	
	if (!mimeType) {
		
		CacheManager.getMimeType(roomID,objectID,context,function(mimeType) {
			mimeTypeDetected(mimeType);
		});
		
	} else {
		mimeTypeDetected(mimeType);
	}
	
}

CacheManager.getInlinePreview=function(roomID, objectID, callback, mimeType,context) {

	if (!context) throw new Error('Missing context in CacheManager.getInlinePreview');
	
	function mimeTypeDetected(mimeType) {
		
		if (!mimeType) {
			callback(false);
		} else {

			/* find provider for inline content: */
			var generatorName = CacheManager.getInlinePreviewProviderName(mimeType);

			if (generatorName == false) {
				Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
				callback(false); //do not set width and height (just send update to clients)
			} else {
				CacheManager.inlinePreviewProviders[generatorName].preview(roomID, objectID, callback, context);
			}
		
		}
		
	}
	
	if (!mimeType) {
		
		CacheManager.getMimeType(roomID,objectID,context,function(mimeType) {
			mimeTypeDetected(mimeType);
		});
		
	} else {
		mimeTypeDetected(mimeType);
	}
	
}

CacheManager.getInlinePreviewMimeType=function(roomID, objectID,context,callback) {
	
	if (!context) throw new Error('Missing context in CacheManager.getInlinePreviewMimeType');
	
	CacheManager.getMimeType(roomID,objectID,context,function(mimeType) {
		
		if (!mimeType) {
			callback(false);
		}

		/* find provider for inline content: */
		var generatorName = CacheManager.getInlinePreviewProviderName(mimeType);

		if (generatorName == false) {
			Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
			callback(false);
		} else {
			callback(CacheManager.inlinePreviewProviders[generatorName].mimeType(roomID, objectID, mimeType, context));
		}
		
	});
	
}



CacheManager.inlinePreviewProviders = {
	
	'image': {
		'mimeType' : function(roomID, objectID, mimeType, context) {
			
			if (!context) throw new Error('Missing context in mimeType for image');
			
			return mimeType;
		},
		'dimensions' : function(roomID, objectID, callback, context) {
			
			if (!context) throw new Error('Missing context in dimensions for image');

			
			var filename = __dirname+"/tmp/image_preview_dimensions_"+roomID+"_"+objectID;

			CacheManager.getContent(roomID,objectID,context,function(content) {
				
				var fs = require('fs');

				fs.writeFile(filename, Buffer(content), function (err) {
				 	if (err) throw err;
					/* temp. file saved */

					var im = require('imagemagick');

					im.identify(filename, function(err, features) {

						if (err) throw err;

						var width = features.width;
						var height = features.height;

						if (width > Modules.config.imageUpload.maxDimensions) {
							height = height*(Modules.config.imageUpload.maxDimensions/width);
							width = Modules.config.imageUpload.maxDimensions;
						}

						if (height > Modules.config.imageUpload.maxDimensions) {
							width = width*(Modules.config.imageUpload.maxDimensions/height);
							height = Modules.config.imageUpload.maxDimensions;
						}

						//delete temp. file
						var fs = require('fs');
						fs.unlink(filename);
						
						callback(width, height);

					});

				});
				
			});
			

		},
		'preview' : function(roomID, objectID, callback, context) {
			
			if (!context) throw new Error('Missing context in preview for image');
//TODO: change image orientation
			CacheManager.getContent(roomID,objectID,context,function(content) {
				
				callback(content);
				
			});

		}
	},
	
	
	'pdf_TODO': {
		'mimeType' : function(roomID, objectID, mimeType, context) {
			
			if (!context) throw new Error('Missing context in mimeType for pdf');
			
			return 'image/jpeg';
		},
		'generatePreviewFile' : function(roomID, objectID, callback, context) {
			
			throw new Error("TODO!");
			
			if (!context) throw new Error('Missing context in generatePreviewFile for pdf');

			var filebase=Modules.Config.filebase;

			var filename = filebase+'/'+roomID+'/'+objectID+'.content';
			var filenamePreview = filebase+'/'+roomID+'/'+objectID+'.preview';
			

			var im = require('imagemagick');
			
			im.convert(['-density', '200x200', 'pdf:'+filename+'[0]', '-quality', '100', 'jpg:'+filenamePreview], 
			function(err, metadata){
			  	if (err) {
					Modules.Log.error("unable to create preview for pdf");
				} else {

					try {
						var content = fs.readFileSync(filenamePreview);
						callback(content);
					} catch (e) {
						Modules.Log.error("not able to read preview file");
					}
					
				}
			});
	
		},
		'dimensions' : function(roomID, objectID, callback, context) {
			
			throw new Error("TODO!");
			
			if (!context) throw new Error('Missing context in dimensions for pdf');

			var filebase=Modules.Config.filebase;

			var filename=filebase+'/'+roomID+'/'+objectID+'.content';
			

			var im = require('imagemagick');

			im.identify(filename, function(err, features) {

				if (err) throw err;
				
				var width = features.width;
				var height = features.height;

				if (width > Modules.config.imageUpload.maxDimensions) {
					height = height*(Modules.config.imageUpload.maxDimensions/width);
					width = Modules.config.imageUpload.maxDimensions;
				}

				if (height > Modules.config.imageUpload.maxDimensions) {
					width = width*(Modules.config.imageUpload.maxDimensions/height);
					height = Modules.config.imageUpload.maxDimensions;
				}

				callback(width, height);
			
			});

		},
		'preview' : function(roomID, objectID, webserverResponse, context) {
			
			throw new Error("TODO!");
			
			if (!context) throw new Error('Missing context in preview for pdf');

			var filebase=Modules.Config.filebase;

			var filename=filebase+'/'+roomID+'/'+objectID+'.preview';

			var path = require('path');

			if (!path.existsSync(filename)) {
				this.generatePreviewFile(roomID, objectID, function(data) {
					/* preview file is generated */
					callback(data);
				});
			} else {
				/* preview file exists */
				try {
					var content = fs.readFileSync(filename);
					callback(content);
				} catch (e) {
					callback(false);
				}
			}

		}
	}
	
}






module.exports=CacheManager;