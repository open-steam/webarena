"use strict";

var KoalaConnection = {};
var WebDav = require('node-dav');
var Modules=false;


KoalaConnection.init=function(theModules){
	this.Modules=theModules;
	Modules=theModules;
}


KoalaConnection.createConnection = function(username, password){

	var koala = new WebDav(username, password, 'https://koala.uni-paderborn.de/webdav/');
	
	return koala;

}


KoalaConnection.listDirectory = function(Connection, path, cb){

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
KoalaConnection.getFiles = function(user, pw, path, callback) {

	var koala = this.createConnection(user, pw);
	
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
			if(path == ""){
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
	
	this.listDirectory(koala, path, function(hierarchy){
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
		callback(result);
	});
	
}


KoalaConnection.getFiles.public = true;

module.exports=KoalaConnection;