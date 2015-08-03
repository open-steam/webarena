"use strict";

var FTPConnector = require('./FileConnector.js');
var JSFtp = require("jsftp");
var fs = require('fs');
var mime = require('mime');
mime.default_type = 'text/plain';


FTPConnector.createFTPConnection = function(host, username, password){

	if(username == "") username = "anonymous";
	if(password == "") password = "@anonymous";

	var FTP = new JSFtp({
		host: host,
		port: 21,
		user: username,
		pass: password
	});
	
	return FTP;

}


FTPConnector.listFTPDirectory = function(Connection, path, cb){

	Connection.ls(path, function(err, res) {
		cb(res);
	});
}


/**
*	returns the hierachy of folders and objects (special format for JSTree!)
*   
*/
FTPConnector.listFTPFiles = function(host, user, pw, path, callback) {

	var FTP = this.createFTPConnection(host, user, pw);
	
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
		if(path == "."){
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
	
	this.listFTPDirectory(FTP, path, function(hierarchy){
		hierarchy.forEach(function(file){
			if(file.name.charAt(0) != "."){
				var node = createNode({
					type: file.type,
					name: file.name
				});
				result.push(node);
			}
		});
		callback(null, result);
	});
	
}


FTPConnector.getFTPFile = function(host, user, pw, path, object, socketID, callback) {

	var FTP = this.createFTPConnection(host, user, pw);
	var that = this;
	path = 	path.slice(0, -1);
	
	var arr = path.split(".");
	var type = arr[arr.length-1];
	var mimeType = mime.lookup(type);
	
	FTP.get(path, function(hadErr, socket) {
		if (hadErr) console.error('There was an error retrieving the file.');
		else{
			var context = that.Modules.UserManager.getConnectionBySocketID(socketID);
			var room = context.rooms.left.id;
			socket.pipe(fs.createWriteStream(that.Modules.Config.filebase + '/' + room + '/' + object + '.content'));
			socket.resume();
			var obj = that.Modules.ObjectManager.getObject(room, object, context);
			
			socket.on('end', function(){
			
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
			});
		}
	});
}

module.exports=FTPConnector;