/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/


"use strict";

var fileConnector={};
var fs = require('fs');
var async = require('async');
var _ = require('underscore');
var Q = require('q');
var mkdirp = require('mkdirp');
var Modules=false;

fileConnector.init=function(theModules){
	this.Modules=theModules;
	Modules=theModules;
}

fileConnector.info=function(){
	return "FileConnector 1.5";
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
fileConnector.login=function(username,password,externalSession,context, callback){
	
	this.Modules.Log.debug("Login request for user '"+username+"'");
	
	var data={};
	
	data.username=username.toLowerCase();
	data.password=password;
	data.home= "public";
	
	if (this.Modules.Config.fileConnectorUsers) {
		
		if (this.Modules.Config.fileConnectorUsers[data.username] == data.password) {
			this.Modules.Log.debug("Login successfull for user '"+username+"'");
			callback(data);
		} else {
			this.Modules.Log.debug("Login failed for user '"+username+"'");
			callback(false);
		}
		
	} else {
		callback(data);
	}
	
}

/**
 *
 * @param context
 * @param callback
 * @returns {*}
 */
fileConnector.getTrashRoom = function(context, callback){
    return this.getRoomData("trash", context, false, callback);
}



fileConnector.listRooms = function(context,callback){
	var self=this;
	
	var filebase = fileConnector.Modules.Config.filebase;
	fs.readdir(filebase, function(err, files){

		var isAccessibleRoom = function(room, callback){
			
			if(/^\./.exec(room)){
				return callback(false);
			}
			var file = filebase +'/'+room;
			fs.stat(file, function(err, result){
				if(err){
					return callback(false);
				}
				
				if (result.isDirectory()){
					self.mayEnter(room,context,function(error,mayEnter){
						
						if (error) {
							callback(false)
						} else {
							if (mayEnter) callback(true); 
							        else  callback(false);
						}
					});
				} else {
					callback(false);
				}
				
			});
		}

		async.filter(files,isAccessibleRoom, function( rooms){
			callback(null, rooms);
		});
	});

}



fileConnector.isLoggedIn=function(context) {
	return true;
}


/* RIGHTS */

fileConnector.mayWrite=function(roomID,objectID,context,callback) {
	callback(null, true);
}

fileConnector.mayRead=function(roomID,objectID,context,callback) {
	callback(null, true);
}

fileConnector.mayDelete=function(roomID,objectID,context,callback) {
	callback(null, true);
}

fileConnector.mayEnter=function(roomID,context,callback) {
	callback(null, true);
}

/**
 *
 * @param roomID
 * @param connection
 * @param {Function} callback
 */
fileConnector.mayInsert=function(roomID,connection,callback) {
	callback(null, true);
}


/**
*	getInventory
*
*	returns all objects in a room (no actual objects, just their attributeset)
*
*/
fileConnector.getInventory=function(roomID,context,callback){
	var self = this;

	this.Modules.Log.debug("Request inventory (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");

	if (!context) throw new Error('Missing context in getInventory');
	
	if (!this.isLoggedIn(context)) this.Modules.Log.error("User is not logged in (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	var filebase=this.Modules.Config.filebase;

	var inventory=[];

	try {
		fs.mkdirSync(filebase+'/'+roomID)
	} catch(e){};

	var files=fs.readdirSync(filebase+'/'+roomID);

    files= files || [];

	files.forEach(function(value,index){
		var position=value.indexOf('.object.txt');
		if(position == -1) return; //not an object file
		var filename=value;
		var objectID=filename.substr(0,position);

		if (roomID==objectID) return; //leave out the room

		try {		
			var obj=self.getObjectDataByFile(roomID,objectID);
			if (obj) inventory.push(obj);
        } catch (e) {
			console.log(e);
			self.Modules.Log.error("Cannot load object with id '"+objectID+"' (roomID: '"+roomID+"', user: '"+self.Modules.Log.getUserFromContext(context)+"')");
		}

	});
	if (callback) {
		/* async */
		process.nextTick(function(){callback(inventory);});
	}
	return inventory;
}

/**
 * Reads the persistent application data and returns
 *
 * @param  {String}   appID    The ID of the app
 * @param  {String}   key      The key of the data
 * @param  {Function} callback The callback function
 */
fileConnector.getApplicationData = function(appID, key, callback){
	var filebase=this.Modules.Config.filebase;

	mkdirp(filebase+'/appdata/'+appID, function(err){
			fs.readdir(filebase+'/appdata/'+appID, function(err, files){

			if(files.length > 0){
				fs.readFile(filebase+'/appdata/'+appID+'/'+files[0], function(err, file){
					var obj = JSON.parse(file);
					callback(null, obj[key]);
				});

			}else{
				var err = {};
				err.toString = function(){err.message};
				err.message = "No states are currently saved";
				callback(err);
			}
		});
	});

	
}

/**
 * saveApplicationData allows an application to write persistent key-value-data for later use
 * (See Roomstate for an example of what you can do)
 *
 * @param  {String} appID The ID of the app
 * @param  {String} key   The key 
 * @param  {Object} value The value that is supposed to be stored
 *
 */
fileConnector.saveApplicationData = function (appID, key, value){
	var self = this

	var filebase=this.Modules.Config.filebase;

	mkdirp(filebase+'/appdata/'+appID, function(err){
		fs.readdir(filebase+'/appdata/'+appID, function(err, files){
			if(files.length >= 1){
				fs.readFile(filebase+'/appdata/'+appID+'/'+files[0], function(err, file){
					var obj = JSON.parse(file);

					obj[key] =  value;

					var newData = JSON.stringify(obj);

					fs.writeFile(filebase+'/appdata/'+appID+'/'+appID+'.data.txt', newData, (err) => {
						if (err) throw err;
					});
				});
			}else{
				var obj = {};

				obj[key] = value;

				var newData = JSON.stringify(obj);

				fs.writeFile(filebase+'/appdata/'+appID+'/'+appID+'.data.txt', newData, (err) => {
					if (err) throw err;
				});
			}
		});
	});
}


/**
 *	getRoomData
 *
 *	Get room data or create room, if doesn't exist yet.
 *
 * @param roomID
 * @param context
 * @param callback
 * @param oldRoomId - id of the parent room
 * @returns {*}
 */
fileConnector.getRoomData=function(roomID,context,oldRoomId,callback){
	this.Modules.Log.debug("Get data for room (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) this.Modules.Log.error("Missing context");
	
	var filebase=this.Modules.Config.filebase;
	var obj=this.getObjectDataByFile(roomID,roomID);
	
	if (!obj){
		obj={};
		obj.id=roomID;
		obj.name=roomID;
		if (oldRoomId) {
			obj.parent=oldRoomId;
		}
		var self=this;
		this.saveObjectData(roomID,roomID,obj,context,true,function(){
			self.Modules.Log.debug("Created room (roomID: '"+roomID+"', user: '"+self.Modules.Log.getUserFromContext(context)+"', parent:'"+oldRoomId+"')");
		})
		
		return self.getRoomData(roomID,context,oldRoomId,callback);
		
	} else {
    	if (callback) {
			/* async */
			process.nextTick(function(){callback(obj);});
		}
	}
}

fileConnector.createRoom=function(roomID, context, callback){
	this.getRoomData(roomID,context,false,callback);
}

/**
*	getRoomHierarchy
*
*	returns the room hierarchy starting by given roomID as root
*
*/
fileConnector.getRoomHierarchy=function(roomID,context,callback){
	
	var self=this;
	var result = {
		'rooms' : {},
		'relation' : {},
		'roots' : []
	};

	//filter only "accessible" rooms
	var filter = function(folders, cb){
		async.filter(folders,
			//Filter function
			function(folder, cb1){
				self.mayEnter(folder, context, function(err, res){
					if(err) cb1(false);
					else cb1(res);
				});
			},
			//Response function
			function(results){
				cb(null, results);
			}
		);
	}

	var buildTree = function(files, cb){
		files.forEach(function(file){
			var obj = self.getObjectDataByFile(file,file);
			if (!obj.attributes) return;
			if (!obj.attributes.name) return;
			result.rooms[file] = '' + obj.attributes.name;
			if (obj.attributes.parent !== undefined) {
				if (result.relation[obj.attributes.parent] === undefined) {
					result.relation[obj.attributes.parent] = new Array(''+file);
				} else {
					result.relation[obj.attributes.parent].push(''+file);
				}
			} else {
				result.roots.push(''+file);
			}
		});
		cb(null, result);
	}

	async.waterfall([self.listRooms, filter, buildTree], function(err, res){
		callback(res);
	});

}

/**
*	save the object (by given data)
*
*	if a callback function is specified, it is called after saving
*
*
*/
fileConnector.saveObjectData=function(roomID,objectID,data,context,createIfNotExists, callback){
	this.Modules.Log.debug("Save object data (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");

	if (!context) this.Modules.Log.error("Missing context");
	if (!data) this.Modules.Log.error("Missing data");
	
	var filebase=this.Modules.Config.filebase;
	
	var foldername=filebase+'/'+roomID;
	
	try {fs.mkdirSync(foldername)} catch(e){};
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.object.txt';
	data=JSON.stringify(data);
	
	if (!createIfNotExists){
		if (!fs.existsSync(filename)){
			this.Modules.Log.error("File does not exist")
		}
	}

	fs.writeFileSync(filename, data,'utf-8');
	if (callback) callback(objectID);
	
}

/**
*	save the object's content
*
*	if a callback function is specified, it is called after saving
*
*/
fileConnector.saveContent=function(roomID, objectID, content,context, inputIsStream, callback){
	this.Modules.Log.debug("Save content from string (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	var that = this;

    var filebase=this.Modules.Config.filebase;
    var foldername=filebase+'/'+roomID;
    try {fs.mkdirSync(foldername)} catch(e){};
    var filename=filebase+'/'+roomID+'/'+objectID+'.content';

	if (!context) this.Modules.Log.error("Missing context");
    if(!!inputIsStream){
        var wr = fs.createWriteStream(filename);
        wr.on("error", function(err) {
            that.Modules.Log.error("Error writing file: " + err);
        });
        content.on("end", function(){
            if (callback) callback(objectID);
        })
        content.pipe(wr);
    } else {
        if (({}).toString.call(content).match(/\s([a-zA-Z]+)/)[1].toLowerCase() == "string") {
            /* create byte array */

            var byteArray = [];
            var contentBuffer = new Buffer(content);

            for (var j = 0; j < contentBuffer.length; j++) {
                byteArray.push(contentBuffer.readUInt8(j));
            }

            content = byteArray;

        }

		try {
			fs.writeFileSync(filename, new Buffer(content));
		} catch (err) {
            this.Modules.Log.error("Could not write content to file (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
        }
		if (callback) callback(objectID);
    
    }
}



/**
*	get the the object's content from a file and save it
*
*	if a callback function is specified, it is called after saving
*
*/
fileConnector.copyContentFromFile=function(roomID, objectID, sourceFilename, context, callback) {
	var that = this
	this.Modules.Log.debug("Copy content from file (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"', source: '"+sourceFilename+"')");
	
	if (!context) this.Modules.Log.error("Missing context");


    var rds = fs.createReadStream(sourceFilename);
    rds.on("error", function(err) {
        that.Modules.Log.error("Error reading file");
    });


	this.saveContent(roomID,objectID,rds,context, true,callback);

}

/**
*	getContent
*
*	get an object's content as an array of bytes
*	
*/
fileConnector.getContent=function(roomID,objectID,context,callback){
	
	this.Modules.Log.debug("Get content (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");

	var filebase=this.Modules.Config.filebase;
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
	try {
		var content = fs.readFileSync(filename);
		
		var byteArray = [];
		var contentBuffer = new Buffer(content);
		
		for (var j = 0; j < contentBuffer.length; j++) {
			
			byteArray.push(contentBuffer.readUInt8(j));
			
		}

		if (callback) {
			//async
			process.nextTick(function(){callback(byteArray);});
		}
		
	} catch (e) {
		this.Modules.Log.debug("Could not read content from file (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
		if (callback) {
			//async
			process.nextTick(function(){callback(false);});
		}
	}
	
}

fileConnector.getContentStream = function(roomID,objectID,context){
    this.Modules.Log.debug("Get content stream (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
    var filebase=this.Modules.Config.filebase;
    var filename=filebase+'/'+roomID+'/'+objectID+'.content';

    var rds = fs.createReadStream(filename);
    rds.on("error", function(err) {
        this.Modules.Log.error("Error reading file: " + filename);
    });

    return rds;
}




/**
*	remove
*
*	remove an object from the persistence layer
*/
fileConnector.remove=function(roomID,objectID,context, callback){
	var that = this;
	
	this.Modules.Log.debug("Remove object (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) this.Modules.Log.error("Missing context");

	var objectBase = this.Modules.Config.filebase + '/' + roomID + "/" + objectID;
	var files = ['.object.txt', '.content', '.preview'].map(function( ending ){
		return objectBase + ending;
	});
	
	async.each(files, fs.unlink, function(err, resp){
		if(callback){
		callback();
		}
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
fileConnector.createObject=function(objectID, roomID, type, data, context, callback){

	this.Modules.Log.debug("Create object "+objectID+" (roomID: '"+roomID+"', type: '"+type+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) this.Modules.Log.error("Missing context");
	
	var uuid = require('node-uuid');

	if(!(objectID)){
		var objectID = uuid.v4();	
	}
	
	data.type=type;
	
	this.saveObjectData(roomID,objectID,data,context,true,callback);
	
}


/**
*	moveObject
*
*	move an object on the persistence layer
*
*	to direcly work on the new object, specify a callback function
*
*	callback(error,newObjectID, oldObjectID)
*
*/
fileConnector.moveObject=function(roomID,toRoom, objectID, context,  callback, copy){

	this.Modules.Log.debug("Move object (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"', toRoom: '"+toRoom+"')");
	
	if (!context) this.Modules.Log.error("Missing context");
	
	var self = this;
	
	if (copy) {
		var uuid = require('node-uuid');
		var newObjectID = uuid.v4();
	} else {
		var newObjectID = objectID;
	}
	
	if (roomID==toRoom && objectID==newObjectID){
		//stop here if we move the object to itself
		return callback(false,objectID,objectID);
	}
	
	var filebase=this.Modules.Config.filebase;
	
	var foldername=filebase+'/'+roomID;
	
	var objectFilename = filebase+'/'+roomID+'/'+objectID+'.object.txt';
	var contentFilename = filebase+'/'+roomID+'/'+objectID+'.content';
	var previewFilename = filebase+'/'+roomID+'/'+objectID+'.preview';
	
	var objectFilenameNew = filebase+'/'+toRoom+'/'+newObjectID+'.object.txt';
	var contentFilenameNew = filebase+'/'+toRoom+'/'+newObjectID+'.content';
	var previewFilenameNew = filebase+'/'+toRoom+'/'+newObjectID+'.preview';

	var fs = require("fs");
	
	var moveFunc = function(source, dest, callback) {
		
		var content=fs.readFileSync(source);
		fs.writeFileSync(dest, content);
		if (!copy) fs.unlinkSync(source);
		
		callback();
	}
	
	/* callback function after moving files */
	var cb = function() {
		if (callback) callback(null, newObjectID, objectID);
	}
	
	/* copy object data */
	moveFunc(objectFilename, objectFilenameNew, function() {
		/* object data copied */

		var path = require('path');

		/* check if content exists */
		if (fs.existsSync(contentFilename)) {

			/* copy content */
			moveFunc(contentFilename, contentFilenameNew, function() {
				/* object content copied */

				/* check if preview exists */
				if (fs.existsSync(previewFilename)) {
					/* copy preview */
					moveFunc(previewFilename, previewFilenameNew, function() {
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



/**
*	duplicateObject
*
*	duplicate an object on the persistence layer
*
*	to direcly work on the new object, specify an after function
*
*	callback(error,newObjectID,oldObjectID);
*
*/
fileConnector.duplicateObject=function(roomID,toRoom, objectID, context,  callback){

	this.moveObject(roomID,toRoom,objectID,context,callback,true);
}


/**
*	getObjectData
*
*	returns the attribute set of an object
*
*/
fileConnector.getObjectData=function(roomID,objectID,context){
	
	this.Modules.Log.debug("Get object data (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(context)+"')");
	
	if (!context) this.Modules.Log.error("Missing context");
	
	var obj = this.getObjectDataByFile(roomID,objectID);
	
	return obj;
	
}



/**
*	internal
*
*	read an object file and return the attribute set
*/
fileConnector.getObjectDataByFile=function(roomID,objectID){
	var filebase = this.Modules.Config.filebase;
	
	var filename=filebase+'/'+roomID+'/'+objectID+'.object.txt';
	
	try {
		var attributes = fs.readFileSync(filename, 'utf8');
		attributes=JSON.parse(attributes);
	} catch (e) {								//if the attribute file does not exist, create an empty one
	
		//when an object is not there, false is returned as a sign of an error
		return false;
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
	
	//assure rooms do not loose their type
	if (roomID==objectID){
		data.type='Room';
		data.attributes.type='Room';
	}
	
	var path = require('path');
	
	filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
	if (fs.existsSync(filename)) {
		
		data.attributes.hasContent=true;
		data.attributes.contentAge=new Date().getTime();
	}

	return data;
}

/**
*	internal
*
*	read an object file from a saved state and return the attribute set
*/
fileConnector.getObjectDataByState=function(roomID,objectID, stateName){
	var filebase = this.Modules.Config.filebase;
	
	var filename=filebase+'/'+roomID+'/'+stateName+'-state'+'/'+objectID+'.object.txt';
	
	try {
		var attributes = fs.readFileSync(filename, 'utf8');
		attributes=JSON.parse(attributes);
	} catch (e) {								//if the attribute file does not exist, create an empty one
	
		//when an object is not there, false is returned as a sign of an error
		return false;
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
	
	//assure rooms do not loose their type
	if (roomID==objectID){
		data.type='Room';
		data.attributes.type='Room';
	}
	
	var path = require('path');
	
	filename=filebase+'/'+roomID+'/'+objectID+'.content';
	
	if (fs.existsSync(filename)) {
		
		data.attributes.hasContent=true;
		data.attributes.contentAge=new Date().getTime();
	}

	return data;
}


fileConnector.trimImage=function(roomID, objectID, context, callback) {

	var self = this;
	
	if (!context) this.Modules.Log.error("Missing context");

	/* save content to temp. file */
	
	//var filename = __dirname+"/tmp/trim_"+roomID+"_"+objectID;

	var os = require('os');
			
	var filename = os.tmpDir()+"/image_preview_dimensions_"+roomID+"_"+objectID;
	
	this.getContent(roomID,objectID,context,function(content) {

		fs.writeFile(filename, new Buffer(content), function (err) {
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
							self.copyContentFromFile(roomID, objectID, filename, context, function() {
							
								//delete temp. file
								fs.unlink(filename);
							
								callback(dX, dY, newWidth, newHeight);
								
							});
							
						} else {
							
							self.Modules.Log.error("Error while trimming "+roomID+"/"+objectID);
						}
					});
				} else {
					console.log(err);
					self.Modules.Log.error("Error getting trim information of "+roomID+"/"+objectID);
				}
			});
		});
	});
};


fileConnector.isInlineDisplayable=function(mimeType) {
	
	if (this.getInlinePreviewProviderName(mimeType) == false) {
		return false;
	} else {
		return true;
	}
	
}

fileConnector.getMimeType=function(roomID,objectID,context,callback) {
	
	if (!context) throw new Error('Missing context in getMimeType');

	var objectData = this.getObjectData(roomID,objectID,context);
	var mimeType = objectData.attributes.mimeType;

	callback(mimeType);
	
}

//SYNC
fileConnector.getInlinePreviewProviderName=function(mimeType) {

	if (!mimeType) return false;

	if (this.getInlinePreviewProviders()[mimeType] != undefined) {
		return this.getInlinePreviewProviders()[mimeType];
	} else {
		return false;
	}
	
}

//SYNC
fileConnector.getInlinePreviewMimeTypes=function() {
	
	var mimeTypes = this.getInlinePreviewProviders();
	var list = {};
	
	for (var mimeType in mimeTypes){
		list[mimeType] = true;
	}
	
	return list;
	
}

//SYNC
fileConnector.getInlinePreviewProviders=function() {
	return {
		//"application/pdf" : "pdf",
		"image/jpeg" : "image",
		"image/jpg" : "image",
		"image/png" : "image",
		"image/gif" : "image",
		"image/bmp" : "image",
		"image/x-bmp" : "image",
		"image/x-ms-bmp" : "image"
	}
}

fileConnector.getInlinePreviewDimensions=function(roomID, objectID, mimeType,context, callback) {
	
	var self = this;
	
	if (!context) throw new Error('Missing context in getInlinePreviewDimensions');
	
	function mimeTypeDetected(mimeType) {
		
		/* find provider for inline content: */
		var generatorName = self.getInlinePreviewProviderName(mimeType);

		if (generatorName == false) {
			self.Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
			callback(false, false); //do not set width and height (just send update to clients)
		} else {
			self.inlinePreviewProviders[generatorName].dimensions(roomID, objectID, context, callback);
		}
		
	}
	
	if (!mimeType) {
		
		self.getMimeType(roomID,objectID,context,function(mimeType) {
			mimeTypeDetected(mimeType);
		});
		
	} else {
		mimeTypeDetected(mimeType);
	}
	
}

fileConnector.getInlinePreview=function(roomID, objectID, mimeType,context, callback) {

	var self = this;

	if (!context) throw new Error('Missing context in getInlinePreview');
	
	function mimeTypeDetected(mimeType) {
		
		if (!mimeType) {
			callback(false);
		} else {

			/* find provider for inline content: */
			var generatorName = self.getInlinePreviewProviderName(mimeType);

			if (generatorName == false) {
				self.Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
				callback(false); //do not set width and height (just send update to clients)
			} else {
				self.inlinePreviewProviders[generatorName].preview(roomID, objectID, context, callback);
			}
		
		}
		
	}
	
	if (!mimeType) {
		
		self.getMimeType(roomID,objectID,context,function(mimeType) {
			mimeTypeDetected(mimeType);
		});
		
	} else {
		mimeTypeDetected(mimeType);
	}
	
}

fileConnector.getInlinePreviewMimeType=function(roomID, objectID,context,callback) {
	
	var self = this;
	
	if (!context) throw new Error('Missing context in getInlinePreviewMimeType');
	
	this.getMimeType(roomID,objectID,context,function(mimeType) {
		
		if (!mimeType) {
			callback(false);
		}

		/* find provider for inline content: */
		var generatorName = self.getInlinePreviewProviderName(mimeType);

		if (generatorName == false) {
			console.trace();
			self.Modules.Log.warn("no generator name for mime type '"+mimeType+"' found!");
			callback(false);
		} else {
			callback(self.inlinePreviewProviders[generatorName].mimeType(roomID, objectID, mimeType, context));
		}
		
	});
	
}



fileConnector.inlinePreviewProviders = {
	
	'image': {
		'mimeType' : function(roomID, objectID, mimeType, context) {
			
			if (!context) throw new Error('Missing context in mimeType for image');
			
			return mimeType;
		},
		'dimensions' : function(roomID, objectID, context, callback) {
			
			if (!context) throw new Error('Missing context in dimensions for image');
			
			//var filename = __dirname+"/tmp/image_preview_dimensions_"+roomID+"_"+objectID;
					
			var os = require('os');
			
			var filename = os.tmpDir()+"/image_preview_dimensions_"+roomID+"_"+objectID;

			fileConnector.getContent(roomID,objectID,context,function(content) {
				fs.writeFile(filename, Buffer(content), function (err) {
				 	if (err) throw err;
					
						/* temp. file saved */
						
					
					var fast_image_size = require('fast-image-size');
						
					fast_image_size ( filename, function ( ret_obj ) {
				        
				        
				        var width = ret_obj.width;
						var height = ret_obj.height;
						
						if (width > fileConnector.Modules.config.imageUpload.maxDimensions) {
							height = height*(fileConnector.Modules.config.imageUpload.maxDimensions/width);
							width = fileConnector.Modules.config.imageUpload.maxDimensions;
						}

						if (height > fileConnector.Modules.config.imageUpload.maxDimensions) {
							width = width*(fileConnector.Modules.config.imageUpload.maxDimensions/height);
							height = fileConnector.Modules.config.imageUpload.maxDimensions;
						}

						//delete temp. file
						fs.unlink(filename);
						
						callback(width, height);

				        
				    });	

				});
				
			});
			

		},
		'preview' : function(roomID, objectID, context, callback) {
			
			if (!context) throw new Error('Missing context in preview for image');

			fileConnector.getContent(roomID,objectID,context,function(content) {
				
				callback(content);
				
			});
					}
				}
}


module.exports=fileConnector;