"use strict";

var WebDavConnector = require('./FileConnector.js');
var WebDav = require('node-dav');
var fs = require('fs');
var mime = require('mime');
mime.default_type = 'text/plain';


/**
*	internal
*/
WebDavConnector.createWebDavConnection = function(host, username, password){

	var connection = new WebDav(username, password, host);
	
	return connection;

}


/**
*	internal
*/
WebDavConnector.listWebDavDirectory = function(Connection, path, cb){

	Connection.PROPFIND(path, function(err, body) {
		var result = [];
		if(body){
			var response = body["d:multistatus"]["d:response"];
			if(response.array){
				var arr = response.array;
				for(var i = 1; i<arr.length; i++){
					result.push(arr[i]["d:href"].text());
				}
			}
			else{
				result.push(response["d:href"].text());
			}
		}
		cb(result);
	});
}


/**
*	internal
*/
WebDavConnector.getWebDavFile = function(Connection, path, cb){
	
	Connection.GET(path, function(err, body){
		if(err){
			console.log("error");
		}
		else{
			cb(body);
		}
	});
}


/**
*	internal
*/
WebDavConnector.setWebDavFile = function(Connection, localPath, remotePath, cb){

	Connection.PUT(localPath, remotePath, function(err, response) {
		if(err){
			console.log("error");
		}
		else{
			cb();
		}
	});
}
	
	
/**
*	returns the hierachy of folders and objects of an WebDav-Server (special format for JSTree!)   
*/
WebDavConnector.listWebDavFiles = function(host, user, pw, path, callback) {

	var conn = this.createWebDavConnection(host, user, pw);
	
	var result = [];
	
    var createNode = function(){
        var node = {};
        var args = arguments[0];

        node.data = {};
		node.metadata = {};
		node.data.title = args.name;
		if(args.type == 0){
			node.data.icon = "/objectIcons/File";
		}
		else{
			node.data.icon = "../../guis.common/images/fileicons/folder_black.png";
			node.state = "closed";
		}
		if(path == ""){
			node.metadata.path = "/"+args.name+"/";
		}
		else{
			node.metadata.path = path+args.name+"/";
		}
		node.metadata.id = args.name;
		node.metadata.name = args.name;
		node.metadata.type = args.type;
		
        return node;
    }
	
	this.listWebDavDirectory(conn, path, function(hierarchy){
		hierarchy.forEach(function(file){
			file = file.replace(/%20/g, ' ');
			var pathArray = file.split("/");
			var node;
			if(file.slice(-1) == "/"){ //Folder
				file = pathArray[pathArray.length-2];
				node = createNode({
					type: 1,
					name: file
				});
			}
			else{ //File
				file = pathArray[pathArray.length-1];
				node = createNode({
					type: 0,
					name: file
				});
			}
			result.push(node);
		});
		callback(null, result);
	});
	
}


/**
*	set a file (specified by its path) from an WebDav-Server as the content of an object (specified by its ID)
*/
WebDavConnector.setWebDavFileAsContent = function(host, user, pw, path, objectID, socketID, callback) {
	
	var conn = this.createWebDavConnection(host, user, pw);
	var that = this;
	
	path = 	path.slice(0, -1);
	
	var arr = path.split(".");
	var type = arr[arr.length-1];
	var mimeType = mime.lookup(type);
	
	this.getWebDavFile(conn, path, function(body){
		var result = [];
		if(body){
			var context = that.Modules.UserManager.getConnectionBySocketID(socketID);
			var roomID = context.rooms.left.id;
			var obj = that.Modules.ObjectManager.getObject(roomID, objectID, context);
			fs.writeFile(that.Modules.Config.filebase + '/' + roomID + '/' + objectID + '.content', body, function(err) {
				if(err) {
					return console.log(err);
				}
				else{
				
					var historyEntry = {
						'objectID' : objectID,
						'roomID' : roomID,
						'action' : 'set Content'
					}
					
					that.Modules.ObjectManager.history.add(new Date().getTime(), context.user.username, historyEntry);
					that.Modules.RoomController.informAllInRoom({"room": roomID, 'message': {'change': 'change'}}, null); 
				
					obj.set('contentAge', new Date().getTime());
					obj.set('mimeType', mimeType);
					obj.persist();
					obj.updateClients('contentUpdate');
			
					/* check if content is inline displayable */
					if (that.Modules.Connector.isInlineDisplayable(mimeType)) {
						obj.set('preview', true);

						/* get dimensions */
						that.Modules.Connector.getInlinePreviewDimensions(roomID, objectID, mimeType, true, function (width, height) {
					
							if (width != false) obj.setAttribute("width", width);
							if (height != false) obj.setAttribute("height", height);

							//send object update to all listeners
							obj.persist();
							obj.updateClients('contentUpdate');

						});

					} else {
						obj.set('preview', false);

						//send object update to all listeners
						obj.persist();
						obj.updateClients('contentUpdate');

					}	
				}
			});
		}
	}); 
}


/**
*	upload the content of an object (specified by its ID) to the specified path of an WebDav-Server
*/
WebDavConnector.uploadContentToWebDav = function(host, user, pw, path, objectID, roomID, callback) {

	var conn = this.createWebDavConnection(host, user, pw);

	this.setWebDavFile(conn, this.Modules.Config.filebase + '/' + roomID + '/' + objectID + '.content', path, callback);

}

module.exports=WebDavConnector;