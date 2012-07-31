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
						"subscribe" : true
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
	
	Modules.Log.debug("CacheManager", "+login", "Login request for user '"+username+"'");
	
	Modules.config.connector.login(username,password,function(data) {
		
		if (data) {
			/* login successfull */
			Modules.Log.debug("CacheManager", "+login", "Login successfull for user '"+username+"'");
			
			/* create cache structure for user */
			CacheManager.cache["users"][username] = {
				"rights" : {

				},
				"userData" : data,
				"context" : context
			};
			
		} else Modules.Log.debug("CacheManager", "+login", "Login failed for user '"+username+"'");
		
		rp(data);
		
	}); //login
	
}

/**
*	 RIGHTS
*/


CacheManager.mayRead=function(roomID,objectID,context){
	
	if (roomID=='undefined') trace();
	
	Modules.Log.debug("CacheManager", "+mayRead", "Check right 'read' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (roomID==objectID) {
		//room
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["read"];
	} else {
		//object
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]["read"];
	}
}

CacheManager.mayWrite=function(roomID,objectID,context){
	Modules.Log.debug("CacheManager", "+mayWrite", "Check right 'write' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (roomID==objectID) {
		//room
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["write"];
	} else {
		//object
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]["write"];
	}
}

CacheManager.mayEvaluate=function(roomID,objectID,context){
	Modules.Log.debug("CacheManager", "+mayEvaluate", "Check right 'evaluate' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (roomID==objectID) {
		//room
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["evaluate"];
	} else {
		//object
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]["evaluate"];
	}
}

CacheManager.mayDelete=function(roomID,objectID,context){
	Modules.Log.debug("CacheManager", "+mayDelete", "Check right 'delete' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (context === true) return true; //root
	if (roomID==objectID) {
		//room
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["delete"];
	} else {
		//object
		return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["objects"][objectID]["delete"];
	}
}


CacheManager.mayCreate=function(roomID,type,context){
	Modules.Log.debug("CacheManager", "+mayCreate", "Check right 'create' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
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

CacheManager.maySubscribe=function(roomID,context,callback){
	Modules.Log.debug("CacheManager", "+maySubscribe", "Check right 'subscribe' (roomID: '"+roomID+"', objectID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (callback == undefined) {
		/* sync. */
		
		if (context === true) return true; //root
		if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] && CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["subscribe"]) {
			return CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["subscribe"];
		} else Modules.Log.error("CacheManager", "+maySubscribe", "Rights not cached for room (sync. access not possible) (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
	} else {
		/* async. */
		
		if (context === true) callback(true); //root
		if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] && CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["subscribe"]) {
			callback(CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["subscribe"]);
		} else {
			CacheManager.getInventory(roomID,context,function() {
				callback(CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID]["room"]["subscribe"]);
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
	Modules.Log.debug("CacheManager", "+getInventory", "Request inventory (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	if (roomID === undefined) Modules.Log.error("CacheManager", "+getInventory", "Missing roomID (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	if (CacheManager.cache["users"][CacheManager.getCacheUser(context)] == undefined) Modules.Log.error("CacheManager", "+getInventory", "User is not logged in (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	//this function is called when objects are loaded
	function objectsLoaded(roomID,context,callback) {

		Modules.Log.debug("CacheManager", "+getInventory", "Inventory objects are loaded (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

		//this function is called when rights are loaded
		function rightsLoaded(roomID,context,callback) {
			Modules.Log.debug("CacheManager", "+getInventory", "User rights are loaded (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			
			var inventory = [];

			for (var i in CacheManager.cache["rooms"][roomID]["objects"]) {
				inventory.push(CacheManager.cache["rooms"][roomID]["objects"][i]["objectData"]);
			}

			CacheManager.maySubscribe(roomID, context, function(maySub) {
				if (maySub) {
					callback(inventory);
				} else Modules.Log.error("CacheManager", "+getInventory", "Missing rights to subscribe (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			});
			
		}
		
		if (CacheManager.cache["users"][CacheManager.getCacheUser(context)]["rights"][roomID] != undefined) {
			//user rights cached
			Modules.Log.debug("CacheManager", "+getInventory", "User rights are cached (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			rightsLoaded(roomID,context,callback);
		} else {
			Modules.Log.debug("CacheManager", "+getInventory", "User rights are not cached (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
			//user rights not cached --> load user rights
			CacheManager.loadUserRights(roomID, context, function() {
				rightsLoaded(roomID,context,callback);
			});
		}
		
	}
	
	
	if (CacheManager.cache["rooms"][roomID] != undefined && CacheManager.cache["rooms"][roomID]["objects"] != undefined) {
		/* room with objects found in cache */
		
		Modules.Log.debug("CacheManager", "+getInventory", "Inventory is cached (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
		objectsLoaded(roomID,context,callback);
		
	} else {
		/* room not cached --> load room */
		Modules.Log.debug("CacheManager", "+getInventory", "Inventory is not cached (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
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
	Modules.Log.debug("CacheManager", "+getCachedInventory", "Load cached inventory (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");

	var inventory = [];

	for (var i in CacheManager.cache["rooms"][roomID]["objects"]) {
		inventory.push(CacheManager.cache["rooms"][roomID]["objects"][i]["objectData"]);
	}

	if (!CacheManager.maySubscribe(roomID, context)) Modules.Log.debug("CacheManager", "+getCachedInventory", "Missing rights to subscribe (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	return inventory;
	
}


//internal
CacheManager.loadUserRights = function(roomID,context,callback) {
	Modules.Log.debug("CacheManager", "-loadUserRights", "Load user rights (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
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
	Modules.Log.debug("CacheManager", "-loadRoom", "Load Room (roomID: '"+roomID+"')");
	
	CacheManager.cache["rooms"][roomID] = {
		"roomData" : {}
	};
	
	Modules.config.connector.withRoomData(roomID,true,function(roomData) {
		Modules.Log.debug("CacheManager", "-loadRoom", "Room data loaded (roomID: '"+roomID+"')");
		
		CacheManager.cache["rooms"][roomID]["roomData"] = roomData;
	
		CacheManager.loadRoomObjects(roomID, loadRoomCallback); //load objects (inventory)
		
	});
	
}

//internal
CacheManager.loadRoomObjects = function(roomID,callback) {
	Modules.Log.debug("CacheManager", "-loadRoomObjects", "Load room objects (roomID: '"+roomID+"')");

		//load room objects
		
		Modules.config.connector.withInventory(roomID,true,function(data) {
			Modules.Log.debug("CacheManager", "-loadRoomObjects", "Got objects from connector (roomID: '"+roomID+"')");
			
			/* create cache structure for room objects */
			CacheManager.cache["rooms"][roomID]["objects"] = {
				
			};

			data.forEach(function(objData){
				
				//TODO: read real content
				var str = "FELIX";
				var bytes = [];

				for (var i = 0; i < str.length; ++i)
				{
				    bytes.push(str.charCodeAt(i));
				}
				
				CacheManager.cache["rooms"][roomID]["objects"][objData.id] = {
					"objectData" : objData,
					"content" : bytes
				};

			});

			callback();

		});
		
	
}


//internal
CacheManager.updateUserRights = function(roomID,callback) {
	Modules.Log.debug("CacheManager", "-updateUserRights", "Update cached rights for all users (roomID: '"+roomID+"')");
	
	function updateDone() {

		numberOfUpdatesDone++;
		
		if (numberOfUpdatesDone == numberOfUpdates) {
			Modules.Log.debug("CacheManager", "-updateUserRights", "All users updated (roomID: '"+roomID+"')");
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
			
			Modules.Log.debug("CacheManager", "-loadUserRights", "Updating cached user rights for user '"+user.userData.username+"' (roomID: '"+roomID+"')");
			
			CacheManager.loadUserRights(roomID,user.context,function() {
				updateDone();
			});
			
		}
		
	}
	
}

//internal
CacheManager.reloadRoomCache=function(roomID,callback) {
	Modules.Log.debug("CacheManager", "-reloadRoomCache", "Reload cached rooms (roomID: '"+roomID+"')");
	
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
	Modules.Log.debug("CacheManager", "+getRoomData", "Get data for room (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!context) Modules.Log.error("CacheManager", "+getRoomData", "Missing context");
	
	function roomLoaded(roomID,context,callback) {

		function rightsLoaded(roomID,context,callback) {
			if (!CacheManager.mayRead(roomID, roomID, context)) Modules.Log.error("CacheManager", "+getRoomData", "Missing rights to read (roomID: '"+roomID+"', user: '"+CacheManager.getCacheUser(context)+"')");
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
	Modules.Log.debug("CacheManager", "+saveObjectData", "Save object data (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayWrite(roomID, objectID, context)) Modules.Log.debug("CacheManager", "+saveObjectData", "Missing rights to write (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	CacheManager.cache["rooms"][roomID]["objects"][objectID]["objectData"]["attributes"] = data; //update object cache
	
	Modules.config.connector.saveObjectData(roomID,objectID,data,after,context);
	
}

/**
*	save the object's content
*
*	if an "after" function is specified, it is called after saving
*
*/
CacheManager.saveContent=function(roomID,objectID,content,after,context,cacheContent){
	Modules.Log.debug("CacheManager", "+saveContent", "Save content from string (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayWrite(roomID, objectID, context)) Modules.Log.debug("CacheManager", "+saveContent", "Missing rights to write (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (cacheContent === true) {
		/* cache content */
		CacheManager.cache["rooms"][roomID]["objects"][objectID]["content"] = content;
	}
	
	Modules.config.connector.saveContent(roomID,objectID,content,after,context);
	
}


/**
*	get the the object's content from a file and save it
*
*	if a callback function is specified, it is called after saving
*
*/
CacheManager.copyContentFromFile=function(roomID, objectID, sourceFilename, callback,context) {
	
	Modules.Log.debug("CacheManager", "+copyContentFromFile", "Copy content from file (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"', source: '"+sourceFilename+"')");
	
	Modules.config.connector.copyContentFromFile(roomID, objectID, sourceFilename, callback,context);
	
}

/**
*	getContent
*
*	get an object's content as an array of bytes
*	
*/
CacheManager.getContent=function(roomID,objectID,context){
	
	Modules.Log.debug("CacheManager", "+getContent", "Get content as String (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayRead(roomID, objectID, context)) Modules.Log.error("CacheManager", "+getContent", "Missing rights to read (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	return CacheManager.cache["rooms"][roomID]["objects"][objectID]["content"];
	
}



/**
*	remove
*
*	remove an object from the persistence layer
*/
CacheManager.remove=function(roomID,objectID,context){
	
	Modules.Log.debug("CacheManager", "+remove", "Remove object (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayDelete(roomID, objectID, context)) Modules.Log.error("CacheManager", "+remove", "Missing rights to delete (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
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

	Modules.Log.debug("CacheManager", "+createObject", "Create object (roomID: '"+roomID+"', type: '"+type+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayCreate(roomID, type, context)) Modules.Log.error("CacheManager", "+createObject", "Missing rights to create object (roomID: '"+roomID+"', type: '"+type+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	Modules.config.connector.createObject(roomID,type,data,function(newObjectId) {
		
		Modules.Log.debug("CacheManager", "+createObject", "Object created (roomID: '"+roomID+"', objectID: '"+newObjectId+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
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
	
	Modules.Log.debug("CacheManager", "+duplicateObject", "Duplicate object (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	Modules.config.connector.duplicateObject(roomID,objectID,function(newObjectId, oldObjectId) {
		Modules.Log.debug("CacheManager", "+duplicateObject", "Object duplicated (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
		
		CacheManager.reloadRoomCache(roomID, function() {
			callback(newObjectId, oldObjectId);
		});
		
	},context);

}


CacheManager.trimImage=function(roomID, objectID, callback, context) {
	
	Modules.config.connector.trimImage(roomID, objectID, callback, context);
	
};


CacheManager.isInlineDisplayable=function(mimeType) {
	
	return Modules.config.connector.isInlineDisplayable(mimeType);
	
}

CacheManager.getMimeType=function(roomID,objectID,context) {
	
	//TODO: this must be asynchronous!
	
}

CacheManager.getInlinePreviewProviderName=function(mimeType) {

	return Modules.config.connector.getInlinePreviewProviderName(mimeType);
	
}

CacheManager.getInlinePreviewMimeTypes=function() {
	
	return Modules.config.connector.getInlinePreviewMimeTypes();
	
}

CacheManager.getInlinePreviewProviders=function() {
	return Modules.config.connector.getInlinePreviewProviders();
}

CacheManager.getInlinePreviewDimensions=function(roomID, objectID, callback, mimeType,context) {
	
	Modules.config.connector.getInlinePreviewDimensions(roomID, objectID, callback, mimeType,context);
	
}

CacheManager.getInlinePreview=function(roomID, objectID, callback, mimeType,context) {
	
	Modules.config.connector.getInlinePreview(roomID, objectID, callback, mimeType,context);
	
}

CacheManager.getInlinePreviewMimeType=function(roomID, objectID,context) {
	
	return Modules.config.connector.getInlinePreviewMimeType(roomID, objectID,context);
	
}



/**
*	getObjectData
*
*	returns the attribute set of an object
*
*/
CacheManager.getObjectData=function(roomID,objectID,context){
	
	Modules.Log.debug("CacheManager", "+getObjectData", "Get object data (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	if (!CacheManager.mayRead(roomID, objectID, context)) Modules.Log.error("CacheManager", "+getObjectData", "Missing rights to read (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+CacheManager.getCacheUser(context)+"')");
	
	return CacheManager.cache["rooms"][roomID]["objects"][objectID]["objectData"];
	
}


module.exports=CacheManager;