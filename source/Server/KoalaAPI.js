/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


"use strict";

function KoalaConnection(host, port, username, password) {
	
	this.host = host;
	this.port = port;
	this.username = username;
	this.password = password;
	
	var self = this;
	
	
	this.request = function(command, functionName, parameters, callback, returnRaw, contentName, content) {

		require('../Common/Log.js').info("KoalaAPI", "-request", '/Rest/'+command+'/'+functionName+'/'+parameters.join('/'));

		var options = {
		  host: self.host,
		  port: self.port,
		  auth: self.username+":"+self.password,
		  path: '/Rest/'+command+'/'+functionName+'/'+parameters.join('/'),
		  method: 'POST'
		};
		

		if (contentName && content) {
			//prepare content to be send via POST

			var querystring = require('querystring'); 

			var post_data = {};
			post_data[contentName] = content;
			
			if (!Buffer.isBuffer(post_data[contentName])) {
				post_data[contentName] = new Buffer(post_data[contentName], 'utf8');
			}
			
			/* encode content (base64) */
			post_data[contentName] = post_data[contentName].toString('base64');
			
			
			post_data = querystring.stringify(post_data);
			
			options.headers = {  
				'Content-Type': 'application/x-www-form-urlencoded',  
				'Content-Length': post_data.length  
			}
			
		}

		
		var http = require('http');
		
		var response = [];
		
		var req = http.request(options, function(res) {

			res.setEncoding('utf8');				
			
			res.on('data', function (chunk) {
				response.push(chunk);
			});
			
			res.on('end', function() {
				if (returnRaw == undefined || returnRaw == false) {
					callback(JSON.parse(response.join('')));
				} else {
					callback(response.join(''));
				}
			});
			
		});
		

		if (contentName && content) {
			console.log("POST: ", contentName);
			console.log("CON: ", content);
			req.write(post_data);
		}

		req.end();
		
	}
	
	
	this.stream = function(command, functionName, parameters, webserverResponse) {
		
		require('../Common/Log.js').info("KoalaAPI", "-stream", '/Rest/'+command+'/'+functionName+'/'+parameters.join('/'));

		var options = {
		  host: self.host,
		  port: self.port,
		  auth: self.username+":"+self.password,
		  path: '/Rest/'+command+'/'+functionName+'/'+parameters.join('/'),
		  method: 'POST'
		};
		
		var http = require('http');
		
		var req = http.request(options, function(res) {

			//res.setEncoding('utf8');				
			
			res.on('data', function (chunk) {
				webserverResponse.write(chunk);
			});
			
			res.on('end', function() {
				webserverResponse.end();
			});
			
		});
		
		req.end();
		
	}
	
	

	
	this.encode = function(s) {
		return escape(JSON.stringify(s));
	}
	
	this.checkLogin = function(callback) {
		
		function check(status) {
			if (status == 401) {
				callback(false);
			} else {
				callback(true);
			}
		}
		
		var options = {
		  host: self.host,
		  port: self.port,
		  auth: self.username+":"+self.password,
		  path: '/Rest/',
		  method: 'POST'
		};
		
		var http = require('http');
		
		var req = http.request(options, function(res) {
			
			res.on('end', function() {
				check(res.statusCode)
			});
			
		});
		req.end();
		
	}
	
	
	//OBJECT
	this.Object = {};
	
	this.Object.getAttributes = function(id, callback) {
		self.request("Object", "getAttributes", [id], callback);
	}
	
	this.Object.getAttribute = function(id, attribute, callback) {
		self.request("Object", "getAttribute", [id, attribute], callback);
	}
	
	this.Object.setAttribute = function(id, attribute, value, callback) {
		self.request("Object", "setAttribute", [id, attribute, self.encode(value)], callback);
	}
	
	this.Object.setAttributes = function(id, attributes, callback) {
		self.request("Object", "setAttributes", [id, self.encode(attributes)], callback, true);
	}
	
	this.Object.move = function(id, destId, callback) {
		self.request("Object", "move", [id, destId], callback);
	}
	
	this.Object.duplicate = function(id, destId, callback) {
		self.request("Object", "duplicate", [id, destId], callback);
	}
	
	this.Object.delete = function(id, callback) {
		self.request("Object", "delete", [id], callback);
	}
	
	this.Object.getObjectById = function(id, callback) {
		self.request("Object", "getObjectById", [id], callback, false, true);
	}
	
	this.Object.getObjectByPath = function(path, callback) {
		self.request("Object", "getObjectByPath", [path], callback);
	}
	
	
	//CONTAINER
	this.Container = {};
	
	this.Container.getInventory = function(id, callback) {
		self.request("Container", "getInventory", [id], callback);
	}
	
	this.Container.create = function(name, destId, callback) {
		self.request("Container", "create", [name, destId], callback);
	}
	
	
	//DOCUMENT
	this.Document = {};
	
	this.Document.getContent = function(id, callback) {
		self.request("Document", "getContent", [id], callback, true);
	}
	
	this.Document.streamContent = function(id, webserverResponse) {
		self.stream("Document", "getContent", [id], webserverResponse);
	}

	this.Document.setContent = function(id, content, callback) {
		self.request("Document", "setContent", [id], callback, false, "content", content);
	}
	
	this.Document.create = function(name, destId, callback) {
		self.request("Document", "create", [name, destId], callback);
	}
	
	this.Document.getDimensions = function(id, callback) {
		self.request("Document", "getDimensions", [id], callback);
	}
	
	
	//DRAWING
	this.Drawing = {};
	
	this.Drawing.create = function(name, destId, type, callback) {
		self.request("Drawing", "create", [name, destId, type], callback);
	}
	
	
	//USER
	this.User = {};
	
	this.User.getMyUser = function(callback) {
		self.request("User", "getMyUser", [], callback);
	}
	
	this.User.getWorkroom = function(id, callback) {
		self.request("User", "getWorkroom", [id], callback);
	}
	
	this.User.getUserByName = function(name, callback) {
		self.request("User", "getUserByName", [name], callback);
	}
	
	this.User.getAllUsers = function(callback) {
		self.request("User", "getAllUsers", [], callback);
	}
	
	this.User.getMemberships = function(id, callback) {
		self.request("User", "getMemberships", [id], callback);
	}
	
	
	//GROUP
	this.Group = {};
	
	this.Group.getWorkroom = function(id, callback) {
		self.request("Group", "getWorkroom", [id], callback);
	}

	this.Group.getGroupByName = function(name, callback) {
		self.request("Group", "getGroupByName", [name], callback);
	}

	this.Group.getAllGroups = function(callback) {
		self.request("Group", "getAllGroups", [], callback);
	}
	
	this.Group.getMembers = function(id, callback) {
		self.request("Group", "getMembers", [id], callback);
	}

	this.Group.addMember = function(id, userId, callback) {
		self.request("Group", "addMember", [id, userId], callback);
	}

	this.Group.removeMember = function(id, userId, callback) {
		self.request("Group", "removeMember", [id, userId], callback);
	}
	
	
}

var KoalaHelper = {};
	
KoalaHelper.convertId = function(id) {
	return id.replace('\\u2323', "").replace('\\u2323', "");
}

KoalaHelper.checkRight = function(rightName, bitRights) {
	
	var bitMasks = {
		"read": 	0x00000001, //1
		"execute": 	0x00000002, //10
		"move": 	0x00000004, //100
		"write": 	0x00000008, //1000
		"insert": 	0x00000010, //10000
		"annotate": 0x00000020, //100000
		"sanction": 0x00000100  //1000000
	}
	
	if (!bitMasks[rightName]) throw new Error("no right with name '"+rightName+"' found!");
	
	if ((bitMasks[rightName] & bitRights) == 0) {
		return false;
	} else {
		return true;
	}
	
}

KoalaHelper.convertType = function(type) {

	var types = {
		"OBJECT":       0x00000001,
		"CONTAINER":    0x00000002,
		"ROOM":         0x00000004,
		"USER":         0x00000008,
		"DOCUMENT":     0x00000010,
		"LINK":         0x00000020,
		"GROUP":        0x00000040,
		"EXIT":         0x00000080,
		"DOCEXTERN":    0x00000100,
		"DOCLPC":       0x00000200,
		"SCRIPT":       0x00000400,
		"DOCHTML":      0x00000800,
		"DATE":         0x00001000,
		"FACTORY":      0x00002000,
		"MODULE":       0x00004000,
		"DATABASE":     0x00008000,
		"PACKAGE":      0x00010000,
		"IMAGE":        0x00020000,
		"MESSAGEBOARD": 0x00040000,
		"GHOST":        0x00080000,
		"SERVERGATE":   0x00100000,
		"TRASHBIN":     0x00200000,
		"DOCXML":       0x00400000,
		"DOCXSL":       0x00800000,
		"LAB":          0x01000000,
		"DOCWIKI":      0x02000000,
		"BUG":          0x04000000,
		"CALENDAR":     0x08000000,
		"SCORM":        0x10000000,
		"DRAWING":      0x20000000,
	};

	var result = [];
	
	for (var name in types) {
		var bitMask = types[name];
		
		if ((bitMask & type) != 0) {
			result.push(name);
		}
		
	}
	
	return result;
	
}

KoalaHelper.getTypes = function(type) {
	return KoalaHelper.convertType(type);
}

KoalaHelper.getType = function(type) {
	var types = KoalaHelper.convertType(type);
	if (types.length > 0) {
		return types[types.length-1];
	} else {
		return false;
	}
}


module.exports = {
	"KoalaConnection" : KoalaConnection,
	"KoalaHelper" : KoalaHelper
};




//var test = new KoalaConnection("www.bid-owl.de.localhost", 80, "root", "steam");

