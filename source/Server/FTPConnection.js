"use strict";

var FTPConnection = {};
var JSFtp = require("jsftp");
var Modules=false;


FTPConnection.init=function(theModules){
	this.Modules=theModules;
	Modules=theModules;
}


FTPConnection.createConnection = function(host, username, password){

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


FTPConnection.listDirectory = function(Connection, path, cb){

	Connection.ls(path, function(err, res) {
		cb(res);
	});
}


/**
*	returns the hierachy of folders and objects (special format for JSTree!)
*   
*/
FTPConnection.getFiles = function(host, user, pw, path, callback) {

	var FTP = this.createConnection(host, user, pw);
	
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
			if(path == "."){
				node.metadata.path = "/"+args.name+"/";
			}
			else{
				node.metadata.path = path+args.name+"/";
			}
		}
		node.metadata.id = args.name;
		node.metadata.name = args.name;
		node.metadata.type = args.type;
		
        return node;
    }
	
	this.listDirectory(FTP, path, function(hierarchy){
		hierarchy.forEach(function(file){
			if(file.name.charAt(0) != "."){
				var node = createNode({
					type: file.type,
					name: file.name
				});
				result.push(node);
			}
		});
		callback(result);
	});
	
}


FTPConnection.getFiles.public = true;

module.exports=FTPConnection;