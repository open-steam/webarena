"use strict";

var WebDavConnector = require('./FileConnector.js');
var WebDav = require('node-dav');
var fs = require('fs');
var mime = require('mime');
mime.default_type = 'text/plain';


WebDavConnector.createWebDavConnection = function(host, username, password){

	var connection = new WebDav(username, password, host);
	
	return connection;

}


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
*	returns the hierachy of folders and objects (special format for JSTree!)
*   
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


WebDavConnector.getWebDavFile = function(host, user, pw, path, object, socketID, callback) {
	
	var conn = this.createWebDavConnection(host, user, pw);
	var that = this;
	
	path = 	path.slice(0, -1);
	
	var arr = path.split(".");
	var type = arr[arr.length-1];
	var mimeType = mime.lookup(type);
	
	conn.GET(path, function(err, body){
		var result = [];
		if(body){
			var context = that.Modules.UserManager.getConnectionBySocketID(socketID);
			var room = context.rooms.left.id;
			var obj = that.Modules.ObjectManager.getObject(room, object, context);
			fs.writeFile(that.Modules.Config.filebase + '/' + room + '/' + object + '.content', body, function(err) {
				if(err) {
					return console.log(err);
				}
				else{
					//console.log("The file was saved!");
					obj.set('contentAge', new Date().getTime());
					obj.set('mimeType', mimeType);
					obj.persist();
					obj.updateClients('contentUpdate');
			
					/* check if content is inline displayable */
					if (that.Modules.Connector.isInlineDisplayable(mimeType)) {
						obj.set('preview', true);

						/* get dimensions */
						that.Modules.Connector.getInlinePreviewDimensions(room, object, mimeType, true, function (width, height) {
					
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

module.exports=WebDavConnector;