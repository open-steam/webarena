/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

/**
*	A connector, as the name says, is the connection between different backends,
*	which save the information persistently, and the WebArena server. Within these
*	connectors, there is is no object logic. Objects are represented just as key=>value
*	datastructures and are found by their room- and object id.
*
*	The koalaConnector is the most simple connector strucure, which just persists
*	object data in plain textfiles.
*
*	Most public functions are provided with a context attribute. This context is
*	either a connection or 'true'. In case of a connection, user credentials are found
*	in context.user.username and context.user.password. If context is just set to 'true'
*	access to all objects should be granted (e.g. by using a root connection).
*
*/

"use strict";

var fs = require('fs');

var Modules=false;
var koalaConnector={};

koalaConnector.info=function(){
	return "KoalaConnector 1.0";
}

koalaConnector.init=function(theModules){
	Modules=theModules;
}

koalaConnector.helper = require('./KoalaAPI.js').KoalaHelper;

koalaConnector.connections = {};

koalaConnector.initConnection = function(username, password, callback) {
	
	if (koalaConnector.connections[username] == undefined) {
		
		var koalaConnection = require('./KoalaAPI.js').KoalaConnection;

		var connection = new koalaConnection(global.config.koalaServer, global.config.koalaPort, username, password);
	
		connection.checkLogin(function(loggedIn) {
		
			if (loggedIn) {
				callback(true);
				koalaConnector.connections[username] = connection;
			} else {
				callback(false);
			}
			
		});
	
	} else {
		callback(true);
	}
	
}

koalaConnector.getConnection = function(context) {

	if (context === true) {
		var username = "root";
	} else {
		var username = context.user.username;
	}
	
	if (koalaConnector.connections[username] != undefined) {
		return koalaConnector.connections[username];
	} else Modules.Log.error("koalaConnector", "+getConnection", "no connection found (user: '"+username+"')");
}


koalaConnector.convertAttributeList = {
	//KOALA : WEBARENA
	"OBJ_NAME" : "name",
	"OBJ_POSITION_X" : "x",
	"OBJ_POSITION_Y" : "y",
	"OBJ_POSITION_Z" : "layer",
	"OBJ_WIDTH" : "width",
	"OBJ_HEIGHT" : "height",
	"DOC_MIME_TYPE" : "mimeType",
	"GRAPHIC_LINESIZE" : "linesize",
	"GRAPHIC_LINECOLOR" : "linecolor",
	"GRAPHIC_FILLCOLOR" : "fillcolor",
	"PAINT_TYPE" : "paintType"
};

koalaConnector.getAttributeNameForWebarena = function(name) {

	if (koalaConnector.convertAttributeList[name] != undefined) {
		return koalaConnector.convertAttributeList[name];
	} else if (name.substring(0, 9) == "WEBARENA_") {
		return name.slice(9).toLowerCase();
	} else return false;
	
}

koalaConnector.getAttributeNameForKoala = function(name) {

	for (var koalaAttribute in koalaConnector.convertAttributeList) {
		var webarenaAttribute = koalaConnector.convertAttributeList[koalaAttribute];
		
		if (name == webarenaAttribute) {
			return koalaAttribute;
		}
		
	}
	
	return "WEBARENA_"+name.toUpperCase();
	
}



koalaConnector.getWebarenaType = function(type, koalaObject) {
	
	if (type == "DOCUMENT" && koalaObject.attributes.DOC_MIME_TYPE == "text/plain") {
		return "Textarea";
	} else if (type == "DOCUMENT" && koalaObject.attributes.PAINT_TYPE == "Paint") {
		return "Paint";
	} else if (type == "DOCUMENT" && koalaObject.attributes.PAINT_TYPE == "Highlighter") {
		return "Highlighter";
	} else if (type == "DOCUMENT") {
		return "File";
	} else if (type == "DRAWING") {
	
		if (koalaObject.attributes.GRAPHIC_TYPE) {
			return koalaObject.attributes.GRAPHIC_TYPE;
		}
	
	} else if (type == "ROOM") {

		if (koalaObject.attributes["bid:collectiontype"] || koalaObject.attributes.OBJ_TYPE) {
			/* room with type --> this is a gallery / portal / etc. */
			
			if (koalaObject.attributes.OBJ_TYPE == "irgendwas") {
				return "IrgendwasObject";
			}
		
			return "UnknownObject";
			
		} else {
			/* real room */
			return "Room";
		}
		
	}
	
	return "UnknownObject";
	
}

/* init new objects (eg. add needed attributes for objects created with koala GUI) */
koalaConnector.initWebarenaObject = function(object, context, callback) {
	
	if (object.attributes.type == "File") {
		/* file object */
		
		if (object.attributes.mimeType == "application/octet-stream" || object.attributes.mimeType == "application/x-unknown-content-type") {
			/* file object without content */
			object.attributes.hasContent = false;
			callback(object);
			
		} else {
			/* file object with content */
			
			object.attributes.hasContent = true;

			if (object.attributes.width == 0 || object.attributes.height == 0) {

				var connection = koalaConnector.getConnection(context);

				connection.Document.getDimensions(object.attributes.id, function(dimObj) {

					if (!dimObj) {
						callback(object);
					} else {

						var width = dimObj.width;
						var height = dimObj.height;

						if (width > Modules.config.imageUpload.maxDimensions) {
							height = height*(Modules.config.imageUpload.maxDimensions/width);
							width = Modules.config.imageUpload.maxDimensions;
						}

						if (height > Modules.config.imageUpload.maxDimensions) {
							width = width*(Modules.config.imageUpload.maxDimensions/height);
							height = Modules.config.imageUpload.maxDimensions;
						}

						object.attributes.width = width;
						object.attributes.height = height;

						callback(object);

					}

				});

			} else {
				callback(object);
			}
			
		}
		
	} else {
		callback(object);
	}
	
}



koalaConnector.buildWebareaObject = function(id, roomID, koalaAttributes, koalaType, koalaObject, context, callback) {
	
	/* new object for webarena */
	var wObject = {
		attributes: {}
	};

	/* get attributes */
	for (var attrName in koalaAttributes) {
		var attrValue = koalaAttributes[attrName];

		/* convert attribute names and check which attributes are needed */
		var attrNameWA = koalaConnector.getAttributeNameForWebarena(attrName);

		if (attrNameWA) {
			wObject.attributes[attrNameWA] = attrValue;
		}

	}


	/* get type */
	wObject.type = koalaConnector.getWebarenaType(koalaConnector.helper.getType(koalaType), koalaObject);

	if (wObject.type == "Drawing") {
		wObject = koalaConnector.convertDrawingToWebarena(wObject, koalaAttributes);
	}

	/* set id / room */
	wObject.id = id;
	wObject.inRoom = roomID;
	wObject.attributes.inRoom = roomID;
	wObject.attributes.id = id;
	wObject.attributes.type = wObject.type;
	
	koalaConnector.initWebarenaObject(wObject, context, function(obj) {
		callback(obj);
	});
	
}



/**
*	login
*
*	logs the user in on the backend. The main purpose of this function is not
*	necessary a persistent connections but verifying the user's credentials
*	and in case of a success, return a user object with username, password and
*	home room for later usage.
*
*	If the login was successful, the newly created user object is sent to a
*	response function.
*
*/
koalaConnector.login=function(username,password,rp){

	// In this simple koalaConnector we accept every password.
	
	koalaConnector.initConnection(username, password, function(loggedIn) {
		
		if (loggedIn) {
			
			var data={};

			data.username=username;
			data.password=password;
			data.home='1645'; //TODO: replace with non static value

			rp(data);
			
		} else {
			/* login failed */
			rp(false);
		}
		
	});
	
	return true;
}

/**
*	 RIGHTS
*/

//TODO: get rights
koalaConnector.getUserRightsForObjects=function(roomID, ids, context, callback) {
	
	var rights = {};
	
	for (var i in ids) {
		rights[ids[i]] = {
			"read" : true,
			"write" : true,
			"evaluate" : true,
			"delete" : true
		}
	}
	
	callback(rights);
	
}

//TODO: get rights
koalaConnector.getUserRightsForRoom=function(roomID, context, callback) {
	callback({
		"read" : true,
		"write" : true,
		"evaluate" : true,
		"delete" : true,
		"create" : {
			"drawing" : true,
			"ellipse" : false,
			"unknown" : true
		},
		"subscribe" : true
	});
}









/**
*	getInventory
*
*	returns all objects in a room (no actual objcts, just their attributeset)
*
*/
koalaConnector.withInventory=function(roomID,context,callback){
	
	if (!context) throw new Error('Missing context in koalaConnector.getInventory');
	
	
	var inventoryObjects = [];
	
	/* inventoryObjects FORMAT:
	
	[ 
	{ attributes: 
	    { name: 'value',
	       ...
		},
	    type: 'Ellipse',
	    id: '37478100592',
	    inRoom: 'public'
	},
	...
	]
	
	*/
	
	var connection = koalaConnector.getConnection(context);
	
	connection.Container.getInventory(roomID, function(inv) {

		var CallbackCollector = require("./CallbackCollector.js");
		var collector = new CallbackCollector(inv.length, function() {
			/* getObjectById for all objects in inventory finished */
			//console.log("DONE!", inventoryObjects);
			callback(inventoryObjects);
		});

		for (var i in inv) {
			var objectId = koalaConnector.helper.convertId(inv[i]);

			connection.Object.getObjectById(objectId, function(koalaObj) {
			
				var id = koalaObj.id;
			
				koalaConnector.buildWebareaObject(id, roomID, koalaObj.object.objects[id].attributes, koalaObj.type, koalaObj.object.objects[id], context, function(obj) {
			
					inventoryObjects.push({
						"attributes" : obj,
						"content" : koalaObj.object.objects[id].content
					});

					collector.call();
					
				});
			
			});
			
		}
		
	});
	
	
	
}

/**
*	getRoomData
*
*	returns the attribute set of the current room
*
*/
koalaConnector.withRoomData=function(roomID,context,callback){
	
	if (!context) throw new Error('Missing context in koalaConnector.getRoomData');

	/* obj FORMAT: 
	
		{ 
		  attributes:
		   { name: 'public',
		     ...
		   },
		  type: 'Room',
		  id: 'public',
		  inRoom: 'public'
		}
	
	*/
	
	var connection = koalaConnector.getConnection(context);
	
	connection.Object.getObjectById(roomID, function(koalaObj) {
	
		var id = koalaObj.id;
	
		koalaConnector.buildWebareaObject(id, id, koalaObj.object.objects[id].attributes, koalaObj.type, koalaObj.object.objects[id], context, function(data) {
			callback(data);
		});
		
	});
	
}

/**
*	save the object (by given data)
*
*	if an "after" function is specified, it is called after saving
*
*/
koalaConnector.saveObjectData=function(roomID,objectID,data,after,context){
	
	if (!context) throw new Error('Missing context in koalaConnector.saveObjectData');
	if (!data) throw new Error('Missing data in koalaConnector.saveObjectData');
	
	/* data FORMAT:
		
		{ 
			name: 'Dolle Ellipse',
	  		...
		}
	
	*/
	
	
	var changedAttributes = {};
	
	for (var key in data) {
		var value = data[key];
	
		//the following attributes will not be saved
		if (key == "inRoom") continue;
		if (key == "type") continue;
		if (key == "id") continue;
	
		changedAttributes[koalaConnector.getAttributeNameForKoala(key)] = value;
		
	}
	
	
	var connection = koalaConnector.getConnection(context);
	
	connection.Object.setAttributes(objectID, changedAttributes, function(result) {
		/* attributes saved */
		
		if (after) after(objectID);
		
	});
	
	
}

/**
*	save the object's content
*
*	if an "after" function is specified, it is called after saving
*
*/
koalaConnector.saveContent=function(roomID,objectID,content,after,context){
	
	if (!context) throw new Error('Missing context in koalaConnector.saveContent');
	
	var connection = koalaConnector.getConnection(context);

	connection.Document.setContent(objectID, content, function(resp) {
		console.log("RESP", resp);
		if (after) after(objectID);
	});
	
}


/**
*	get the the object's content from a file and save it
*
*	if a callback function is specified, it is called after saving
*
*/
koalaConnector.copyContentFromFile=function(roomID, objectID, sourceFilename, callback, context) {
	
	if (!context) throw new Error('Missing context in koalaConnector.copyContentFromFile');
	
	var connection = koalaConnector.getConnection(context);
	
	var fs = require('fs');
	
	var content = fs.readFileSync(sourceFilename);

	
	connection.Document.setContent(objectID, content, function() {
		
		callback(objectID);
		
	});
	
}


/**
*	remove
*
*	remove an object from the persistence layer
*/
koalaConnector.remove=function(roomID,objectID,context){
	
	if (!context) throw new Error('Missing context in koalaConnector.remove');
	
	var connection = koalaConnector.getConnection(context);
	
	connection.Object.delete(objectID, function() {
		//done
	});
	
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
koalaConnector.createObject=function(roomID,type,data,callback,context){

	if (!context) throw new Error('Missing context in koalaConnector.createObject');
	
	function setData(obj,data) {
	
		var newId = koalaConnector.helper.convertId(obj.index);
		
		koalaConnector.saveObjectData(roomID,newId,data,function() {
			callback(newId);
		}, context);
	
	}
	
	
	var connection = koalaConnector.getConnection(context);
	
	if (type == "Textarea") {
		
		connection.Document.create("NEW", roomID, function(newKoalaObject) {
			
			data.mimeType = 'text/plain';
			
			setData(newKoalaObject, data);
			
		});
		
		return;
	}
	
	if (type == "File") {
		
		connection.Document.create("NEW", roomID, function(newKoalaObject) {

			data.mimeType = 'application/octet-stream';
			data.hasContent = false;
			
			setData(newKoalaObject, data);
			
		});
		
		return;
	}
	
	if (type == "Rectangle" || type == "Ellipse" || type == "Polygon") {
		
		connection.Drawing.create("NEW", roomID, type, function(newKoalaObject) {
			
			//data.mimeType = 'application/octet-stream';
			
			setData(newKoalaObject, data);
			
		});
		
		return;
	}
	
	if (type == "Paint" || type == "Highlighter") {
		
		connection.Document.create("NEW", roomID, function(newKoalaObject) {

			if (type == "Paint") {
				data.paintType = 'Paint';
			} else {
				data.paintType = 'Highlighter';
			}

			data.mimeType = 'image/png';
			data.hasContent = false;
			
			setData(newKoalaObject, data);
			
		});
		
		return;
	}
	
	Modules.Log.warn("koalaConnector", "+createObject", "No handler for creating object of type '"+type+"'!");
	
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
koalaConnector.duplicateObject=function(roomID,objectID,callback,context){
	
	if (!context) throw new Error('Missing context in koalaConnector.context');

	var connection = koalaConnector.getConnection(context);
	
	connection.Object.duplicate(objectID, roomID, function(newKoalaObject) {
		
		var newId = koalaConnector.helper.convertId(newKoalaObject.index);
		
		if (callback) callback(newId, objectID);
		
	});
	
}


koalaConnector.trimImage=function(roomID, objectID, callback, context) {
	
	if (!context) throw new Error('Missing context in koalaConnector.trimImage');

	/* download file */
	var connection = koalaConnector.getConnection(context);

	var filename = __dirname+"/tmp/trim_"+roomID+"_"+objectID;

	var writeStream = fs.createWriteStream(filename);
	
	connection.Document.streamContent(objectID, writeStream);
	
	writeStream.on('end', function() {
		
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

						callback(dX, dY, newWidth, newHeight);

					} else {
						console.log("trimImage: error while trimming "+roomID+"/"+objectID);
						callback(false);
					}

				});

			} else {
				console.log("trimImage: error getting trim information of "+roomID+"/"+objectID);
				callback(false);
			}

		});
		
	});

};


koalaConnector.isInlineDisplayable=function(mimeType) {
	
	if (this.getInlinePreviewProviderName(mimeType) == false) {
		return false;
	} else {
		return true;
	}
	
}

koalaConnector.getMimeType=function(roomID,objectID,context,callback) {
	
	if (!context) throw new Error('Missing context in koalaConnector.getMimeType');

	var connection = koalaConnector.getConnection(context);
	
	connection.Object.getObjectById(objectID, function(koalaObj) {
	
		console.log("DETECTED MIME: ", koalaObj.object.objects[objectID].attributes.DOC_MIME_TYPE);
	
		callback(koalaObj.object.objects[objectID].attributes.DOC_MIME_TYPE);
		
	});
	
}

//SYNC
koalaConnector.getInlinePreviewProviderName=function(mimeType) {

	if (!mimeType) return false;

	if (this.getInlinePreviewProviders()[mimeType] != undefined) {
		return this.getInlinePreviewProviders()[mimeType];
	} else {
		return false;
	}
	
}

//SYNC
koalaConnector.getInlinePreviewMimeTypes=function() {
	
	var mimeTypes = this.getInlinePreviewProviders();
	var list = {};
	
	for (var mimeType in mimeTypes){
		list[mimeType] = true;
	}
	
	return list;
	
}

//SYNC
koalaConnector.getInlinePreviewProviders=function() {
	return {
		//"application/pdf" : "pdf",
		"image/jpeg" : "image",
		"image/jpg" : "image",
		"image/png" : "image",
		"image/gif" : "image"
	}
}

koalaConnector.getInlinePreviewDimensions=function(roomID, objectID, callback, mimeType, context) {
	
	if (!context) throw new Error('Missing context in koalaConnector.getInlinePreviewDimensions');
	
	function mimeTypeDetected(mimeType) {
		
		/* find provider for inline content: */
		var generatorName = koalaConnector.getInlinePreviewProviderName(mimeType);

		if (generatorName == false) {
			console.log("getInlinePreviewDimensions: no generator name for mime type '"+mimeType+"' found!");
			callback(false, false); //do not set width and height (just send update to clients)
		} else {
			koalaConnector.inlinePreviewProviders[generatorName].dimensions(roomID, objectID, callback, context);
		}
		
	}
	
	if (!mimeType) {
		
		koalaConnector.getMimeType(roomID,objectID,context,function(mimeType) {
			mimeTypeDetected(mimeType);
		});
		
	} else {
		mimeTypeDetected(mimeType);
	}
	
}

koalaConnector.getInlinePreview=function(roomID, objectID, callback, mimeType, context) {
	
	if (!context) throw new Error('Missing context in koalaConnector.getInlinePreview');
	
	function mimeTypeDetected(mimeType) {
		
		if (!mimeType) {
			callback(false);
		} else {

			/* find provider for inline content: */
			var generatorName = koalaConnector.getInlinePreviewProviderName(mimeType);

			if (generatorName == false) {
				console.log("getInlinePreview: no generator name for mime type '"+mimeType+"' found!");
				callback(false); //do not set width and height (just send update to clients)
			} else {
				koalaConnector.inlinePreviewProviders[generatorName].preview(roomID, objectID, callback, context);
			}
		
		}
		
	}
	
	if (!mimeType) {
		
		koalaConnector.getMimeType(roomID,objectID,context,function(mimeType) {
			mimeTypeDetected(mimeType);
		});
		
	} else {
		mimeTypeDetected(mimeType);
	}
	
}

koalaConnector.getInlinePreviewMimeType=function(roomID, objectID, context, callback) {
	
	if (!context) throw new Error('Missing context in koalaConnector.getInlinePreviewMimeType');
	
	koalaConnector.getMimeType(roomID,objectID,context,function(mimeType) {
		
		if (!mimeType) {
			callback(false);
		}

		/* find provider for inline content: */
		var generatorName = koalaConnector.getInlinePreviewProviderName(mimeType);

		if (generatorName == false) {
			console.log("getInlinePreviewMimeType: no generator name for mime type '"+mimeType+"' found!");
			callback(false);
		} else {
			callback(koalaConnector.inlinePreviewProviders[generatorName].mimeType(roomID, objectID, mimeType, context));
		}
		
	});
	
}

koalaConnector.inlinePreviewProviders = {
	
	'image': {
		'mimeType' : function(roomID, objectID, mimeType, context) {
			
			if (!context) throw new Error('Missing context in mimeType for image');
			
			return mimeType;
		},
		'dimensions' : function(roomID, objectID, callback, context) {
			
			if (!context) throw new Error('Missing context in dimensions for image');


			var connection = koalaConnector.getConnection(context);

			connection.Document.getDimensions(objectID, function(dimObj) {

				if (!dimObj) {
					callback(false, false);
				} else {

					var width = dimObj.width;
					var height = dimObj.height;

					if (width > Modules.config.imageUpload.maxDimensions) {
						height = height*(Modules.config.imageUpload.maxDimensions/width);
						width = Modules.config.imageUpload.maxDimensions;
					}

					if (height > Modules.config.imageUpload.maxDimensions) {
						width = width*(Modules.config.imageUpload.maxDimensions/height);
						height = Modules.config.imageUpload.maxDimensions;
					}

					callback(width, height);

				}

			});

		},
		'preview' : function(roomID, objectID, webserverResponse, context) {
			
			if (!context) throw new Error('Missing context in preview for image');
			
			var connection = koalaConnector.getConnection(context);

			connection.Document.streamContent(objectID, webserverResponse);

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
					console.log("error creating preview for pdf");
					callback(false);
				} else {

					try {
						var content = fs.readFileSync(filenamePreview);
						callback(content);
					} catch (e) {
						callback(false);
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


module.exports=koalaConnector;