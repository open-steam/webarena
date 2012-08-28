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
*	The fileconnector is the most simple connector strucure, which just persists
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
var fileConnector={};

fileConnector.info=function(){
	return "FileConnector 1.0";
}

fileConnector.init=function(theModules){
	Modules=theModules;
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
fileConnector.login=function(username,password,rp){

	// In this simple fileConnector we accept every password.
	
	var data={};
	
	data.username=username;
	data.password=password;
	data.home='public';
	
	rp(data);
	
	return true;
}

/**
*	 RIGHTS
*/

fileConnector.mayRead=function(roomID,objectID,context){
	if (!context) throw new Error('Missing context in fileConnector.mayRead');
	return true;	
}

fileConnector.mayWrite=function(roomID,objectID,context){
	if (!context) throw new Error('Missing context in fileConnector.mayWrite');
	return true;	
}

fileConnector.mayEvaluate=function(roomID,objectID,context){
	if (!context) throw new Error('Missing context in fileConnector.mayEvaluate');
	return true;
}

fileConnector.mayDelete=function(roomID,objectID,context){
	if (!context) throw new Error('Missing context in fileConnector.mayDelete');
	return true;	
}

fileConnector.mayCreate=function(roomID,type,context){
	if (!context) throw new Error('Missing context in fileConnector.mayCreate');
	return true;
}

fileConnector.maySubscribe=function(room,context){
	if (!context) throw new Error('Missing context in fileConnector.maySubscribe');
	return true;
}

fileConnector.getUserRightsForObjects=function(roomID, ids, context, callback) {
	
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

fileConnector.getUserRightsForRoom=function(roomID, context, callback) {
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
fileConnector.withInventory=function(roomID,context,callback){
	
	if (!context) throw new Error('Missing context in fileConnector.getInventory');
	
	//load the rooms contents. Do not care about rights.
	
	var filebase=Modules.Config.filebase;
	
	var inventory=[];
	
	try {fs.mkdirSync(filebase+'/'+roomID)} catch(e){};
	
	var files=fs.readdirSync(filebase+'/'+roomID);
	        
    files=(files)?files:[];
	
	files.forEach(function(value,index){
		var position=value.indexOf('.object.txt');
		if(position == -1) return; //not an object file
		var filename=value;
		var objectID=filename.substr(0,position);
		
		if (roomID==objectID) return; //leave out the room
		
		try {		
			var obj=getObjectDataByFile(filebase,roomID,objectID);
			inventory.push({
				"attributes" : obj,
				"content" : false
			});
		} catch (e) {
			console.log('ERROR: Cannot load '+objectID+' in '+roomID);
			console.log(e);
		}
		
	});
	
	callback(inventory);
	
}

/**
*	getRoomData
*
*	returns the attribute set of the current room
*
*/
fileConnector.withRoomData=function(roomID,context,callback){
	
	if (!context) throw new Error('Missing context in fileConnector.getRoomData');

	var filebase=Modules.Config.filebase;
	var obj=getObjectDataByFile(filebase,roomID,roomID);
	
	callback(obj);
	
}

/**
*	save the object (by given data)
*
*	if an "after" function is specified, it is called after saving
*
*/
fileConnector.saveObjectData=function(roomID,objectID,data,after,context){
	
	if (!context) throw new Error('Missing context in fileConnector.saveObjectData');
	if (!data) throw new Error('Missing data in fileConnector.saveObjectData');

	var filebase=Modules.Config.filebase;
	
	var foldername=filebase+'/'+roomID;
	
	try {fs.mkdirSync(foldername)} catch(e){};
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.object.txt';
	data=JSON.stringify(data);
	
	//TODO Change to asynchronous access
	
	fs.writeFileSync(filename, data,'utf-8');
	if (after) after(objectID);
	
}

/**
*	save the object's content
*
*	if an "after" function is specified, it is called after saving
*
*/
fileConnector.saveContent=function(roomID,objectID,content,after,context){
	
	if (!context) throw new Error('Missing context in fileConnector.saveContent');
	
	var filebase=Modules.Config.filebase;
	
	var foldername=filebase+'/'+roomID;
	
	try {fs.mkdirSync(foldername)} catch(e){};
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
	fs.writeFile(filename, content, function (err) {
		  if (err) {
		  	console.log('Could not write: ',err);
		  }
		  if (after) after(objectID);
	});

	
}


/**
*	get the the object's content from a file and save it
*
*	if a callback function is specified, it is called after saving
*
*/
fileConnector.copyContentFromFile=function(roomID, objectID, sourceFilename, callback,context) {
	
	if (!context) throw new Error('Missing context in fileConnector.copyContentFromFile');
	
	var filebase=Modules.Config.filebase;
	
	var foldername=filebase+'/'+roomID;
	
	try {fs.mkdirSync(foldername)} catch(e){};
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
	fs.rename(sourceFilename, filename, function (err) {
		  if (err) {
		  	console.log('Could not write: ',err);
		  }
		  if (callback) callback(objectID);
	});
	
	
	
}

/**
*	getContent
*
*	get an object's content as a an array of bytes;
*	
*/
fileConnector.getContent=function(roomID,objectID,context){
	
	if (!context) throw new Error('Missing context in fileConnector.getContent');
	
	var filebase=Modules.Config.filebase;
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
	try {
		var content = fs.readFileSync(filename);
		return content;
	} catch (e) {
		return false;
	}
}



/**
*	remove
*
*	remove an object from the persistence layer
*/
fileConnector.remove=function(roomID,objectID,context){
	
	if (!context) throw new Error('Missing context in fileConnector.remove');
	
	var filebase=Modules.Config.filebase;
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.object.txt';
	
	fs.unlink(filename, function (err) {});
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
	fs.unlink(filename, function (err) {});
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.preview';
	
	fs.unlink(filename, function (err) {});
	
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
fileConnector.createObject=function(roomID,type,data,callback,context){
	
	if (!context) throw new Error('Missing context in fileConnector.createObject');
	
	var objectID=new Date().getTime()-1296055327011;
	
	data.type=type;
	
	this.saveObjectData(roomID,objectID,data,callback,context);
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
fileConnector.duplicateObject=function(roomID,objectID,callback,context){
	
	if (!context) throw new Error('Missing context in fileConnector.context');

	var self = this;

	var newObjectID = new Date().getTime()-1296055327011;
	
	var filebase=Modules.Config.filebase;
	
	var foldername=filebase+'/'+roomID;
	
	var objectFilename = filebase+'/'+roomID+'/'+objectID+'.object.txt';
	var contentFilename = filebase+'/'+roomID+'/'+objectID+'.content';
	var previewFilename = filebase+'/'+roomID+'/'+objectID+'.preview';
	
	var objectFilenameNew = filebase+'/'+roomID+'/'+newObjectID+'.object.txt';
	var contentFilenameNew = filebase+'/'+roomID+'/'+newObjectID+'.content';
	var previewFilenameNew = filebase+'/'+roomID+'/'+newObjectID+'.preview';
	
	
	var sys = require("util");
	var fs = require("fs");
	
	var copyFunc = function(source, dest, callback) {
		
		var read = fs.createReadStream(source);
		var write = fs.createWriteStream(dest);

		read.on("end", callback); 
		sys.pump(read, write);
		
	}
	
	/* callback function after duplicating files */
	var cb = function() {

		if (callback) callback(newObjectID, objectID);
		
	}
	
	/* copy object data */
	copyFunc(objectFilename, objectFilenameNew, function() {
		/* object data copied */

		var path = require('path');

		/* check if content exists */
		if (path.existsSync(contentFilename)) {

			/* copy content */
			copyFunc(contentFilename, contentFilenameNew, function() {
				/* object content copied */

				/* check if preview exists */
				if (path.existsSync(previewFilename)) {

					/* copy preview */
					copyFunc(previewFilename, previewFilenameNew, function() {
						/* object preview copied */

						cb();
						return true;

					});

				} else {

					cb();
					return true;
				}
				
			});

		} else {

			cb();
			return true;
		}
		
	});

}


fileConnector.trimImage=function(roomID, objectID, callback, context) {
	
	if (!context) throw new Error('Missing context in fileConnector.trimImage');

	var im = require('imagemagick');
	
	var filebase=Modules.Config.filebase;
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
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
	
};


fileConnector.isInlineDisplayable=function(mimeType) {
	
	if (this.getInlinePreviewProviderName(mimeType) == false) {
		return false;
	} else {
		return true;
	}
	
}

fileConnector.getMimeType=function(roomID,objectID,context) {
	
	if (!context) throw new Error('Missing context in fileConnector.getMimeType');
	
	var filebase=Modules.Config.filebase;
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.object.txt';
	
	try {
		var attributes = fs.readFileSync(filename, 'utf8');
		attributes=JSON.parse(attributes);
	} catch (e) {
		console.log("fileConnector.getInlinePreviewDimensions: unable to read file '"+filename+"'");
		return false;
	}
	
	var mimeType = attributes.mimeType;
	
	if (!mimeType) {
		console.log("fileConnector.getMimeType: unable to read mimeType of object '"+objectID+"'");
		return false;
	}
	
	if (!this.isInlineDisplayable(mimeType)) {
		console.log("fileConnector.getMimeType: object '"+objectID+"' with mime type '"+mimeType+"' is not inline displayable!");
		return false;
	}
	
	return mimeType;
	
}

fileConnector.getInlinePreviewProviderName=function(mimeType) {

	if (!mimeType) return false;

	if (this.getInlinePreviewProviders()[mimeType] != undefined) {
		return this.getInlinePreviewProviders()[mimeType];
	} else {
		return false;
	}
	
}

fileConnector.getInlinePreviewMimeTypes=function() {
	
	var mimeTypes = this.getInlinePreviewProviders();
	var list = {};
	
	for (var mimeType in mimeTypes){
		list[mimeType] = true;
	}
	
	return list;
	
}

fileConnector.getInlinePreviewProviders=function() {
	return {
		"application/pdf" : "pdf",
		"image/jpeg" : "image",
		"image/png" : "image",
		"image/gif" : "image"
	}
}

fileConnector.getInlinePreviewDimensions=function(roomID, objectID, callback, mimeType,context) {
	
	if (!context) throw new Error('Missing context in fileConnector.getInlinePreviewDimensions');
	
	if (!mimeType) {
		var mimeType = fileConnector.getMimeType(roomID,objectID);
	}
	
	/* find provider for inline content: */
	var generatorName = this.getInlinePreviewProviderName(mimeType);
	
	if (generatorName == false) {
		console.log("getInlinePreviewDimensions: no generator name for mime type '"+mimeType+"' found!");
		callback(false, false); //do not set width and height (just send update to clients)
	} else {
		this.inlinePreviewProviders[generatorName].dimensions(roomID, objectID, callback, context);
	}
	
}

fileConnector.getInlinePreview=function(roomID, objectID, callback, mimeType,context) {
	
	if (!context) throw new Error('Missing context in fileConnector.getInlinePreview');
	
	if (!mimeType) {
		var mimeType = fileConnector.getMimeType(roomID,objectID,context);
	}
	
	if (!mimeType) {
		return false;
		callback(false);
	}
	
	/* find provider for inline content: */
	var generatorName = this.getInlinePreviewProviderName(mimeType);

	if (generatorName == false) {
		console.log("getInlinePreview: no generator name for mime type '"+mimeType+"' found!");
		callback(false); //do not set width and height (just send update to clients)
	} else {
		this.inlinePreviewProviders[generatorName].preview(roomID, objectID, callback, context);
	}
	
}

fileConnector.getInlinePreviewMimeType=function(roomID, objectID,context) {
	
	if (!context) throw new Error('Missing context in fileConnector.getInlinePreviewMimeType');
	
	var mimeType = fileConnector.getMimeType(roomID,objectID,context);
	
	if (!mimeType) {
		return false;
	}
	
	/* find provider for inline content: */
	var generatorName = this.getInlinePreviewProviderName(mimeType);
	
	if (generatorName == false) {
		console.log("getInlinePreviewMimeType: no generator name for mime type '"+mimeType+"' found!");
		return false;
	} else {
		return this.inlinePreviewProviders[generatorName].mimeType(roomID, objectID, mimeType, context);
	}
	
}

fileConnector.inlinePreviewProviders = {
	
	'image': {
		'mimeType' : function(roomID, objectID, mimeType, context) {
			
			if (!context) throw new Error('Missing context in mimeType for image');
			
			return mimeType;
		},
		'dimensions' : function(roomID, objectID, callback, context) {
			
			if (!context) throw new Error('Missing context in dimensions for image');

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
			
			if (!context) throw new Error('Missing context in preview for image');

			var filebase=Modules.Config.filebase;

			var filename=filebase+'/'+roomID+'/'+objectID+'.content';

			try {
				var content = fs.readFileSync(filename);
				webserverResponse.write(content);
				webserverResponse.end();
			} catch (e) {
				webserverResponse.end("error!");
			}

		}
	},
	
	
	'pdf': {
		'mimeType' : function(roomID, objectID, mimeType, context) {
			
			if (!context) throw new Error('Missing context in mimeType for pdf');
			
			return 'image/jpeg';
		},
		'generatePreviewFile' : function(roomID, objectID, callback, context) {
			
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
		'preview' : function(roomID, objectID, callback, context) {
			
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

/**
*	internal
*
*	read an object file and return the attribute set
*/
var getObjectDataByFile=function(filebase,roomID,objectID){
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.object.txt';
	
	try {
		var attributes = fs.readFileSync(filename, 'utf8');
		attributes=JSON.parse(attributes);
	} catch (e) {								//if the attribute file does not exist, create an empty one
		var attributes={};
		attributes.name=objectID;
	}
	
	var data={};
	
	//	automatically repair some values which could be wrong due
	//  to manual file copying.
	
	data.attributes=attributes;
	data.type=data.attributes.type;
	data.id=objectID;
	data.attributes.id=data.id;
	data.inRoom=roomID;
	data.attributes.inRoom=roomID;
	data.attributes.hasContent=false;
	
	var path = require('path');
	
	filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
	if (path.existsSync(filename)) {
		
		data.attributes.hasContent=true;
		data.attributes.contentAge=new Date().getTime();
	}
	
	//TODO check for content => hasConent

	return data;
}

/**
*	getObjectData
*
*	returns the attribute set of an object
*
*/
fileConnector.getObjectData=function(roomID,objectID,context){
	
	if (!context) throw new Error('Missing context in fileConnector.getObjectData');
	
	var obj=getObjectDataByFile(Modules.Config.filebase,roomID,objectID);
	
	return obj;
}

module.exports=fileConnector;