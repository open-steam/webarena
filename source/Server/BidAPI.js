/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


"use strict";

/**
 * @class Connection to bidowl server
 * @param {String} host The host to connect to
 * @param {int} port The port number of the service
 * @param {String} username The username
 * @param {String} password The password
 */
function BidConnection(protocol, host, port, username, password) {
	
	console.log('Created BidConnection',protocol,host,port,username,password);
	
	this.protocol = protocol;
	this.host = host;
	this.port = port;
	this.username = username;
	this.password = password;
	
	this.requestCounter = 0;
	
	var self = this;
	
	/**
	 * Perform a request
	 * @param {String} command The command name
	 * @param {String} functionName The name of the function
	 * @param {Array} parameters Array of parameters
	 * @param {Function} callback The callback function for successful requests
	 * @param {bool} [returnRaw] True if response should be passed to callback-function without JSON parsing
	 * @param {String} [contentName] Name of the POST content
	 * @param {String} [content] The POST content
	 */
	this.request = function(command, functionName, parameters, callback, returnRaw, contentName, content) {
		
		
		console.log('BidAPI request ',command,functionName,parameters);

		self.requestCounter = self.requestCounter+1;

		var reqC = parseInt(self.requestCounter);

		require('../Common/Log.js').debug('request ('+reqC+'): /Rest/'+command+'/'+functionName+'/'+parameters.join('/'));

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

		
		var http = require(this.protocol);
		
		var response = [];
		
		var req = http.request(options, function(res) {
			
			console.log('http request ',options,res);

			if (returnRaw == undefined || returnRaw == false) {
				res.setEncoding('utf8');
			} else {
				//res.setEncoding('binary');
			}
			
			res.on('data', function (chunk) {
				response.push(chunk);
			});
			
			res.on('end', function() {
				if (returnRaw == undefined || returnRaw == false) {
					callback(JSON.parse(response.join('')));
				} else {
					
					var byteArray = [];
					
					for (var i = 0; i < response.length; i++) {
						
						for (var j = 0; j < response[i].length; j++) {
							
							byteArray.push(response[i].readUInt8(j));
							
						}
						
					}

					callback(byteArray);
					
				}
			});
			
		});
		

		if (contentName && content) {
			req.write(post_data);
		}
		
		req.on('error', function(err) {
        	require('../Common/Log.js').error('BidAPI request failed '+err.message);
    	});

		req.end();
		
	}
	
	

	
	this.encode = function(s) {
		return escape(JSON.stringify(s));
	}
	
	
	/**
	 * check login data
	 * @param {Function} callback Callback function
	 */
	this.checkLogin = function(callback) {
		
		console.log('checkLogin');
		
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
		
		consloe.log(options);
		
		var http = require(this.protocol);
		
		var req = http.request(options, function(res) {
			
			res.on('end', function() {
				check(res.statusCode)
			});
			
		});
		
		req.on('error', function(err) {
        	require('../Common/Log.js').error('BidAPI checkLogin failed '+err.message);
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
	
	this.Object.checkRight = function(id, type, callback) {
		self.request("Object", "checkRight", [id, type], callback);
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

	this.Document.setContent = function(id, content, callback) {
		self.request("Document", "setContent", [id], callback, true, "content", content);
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
	
	this.User.getMyWorkroom = function(callback) {
		self.request("User", "getMyWorkroom", [], callback);
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

var BidHelper = {};
	
BidHelper.convertId = function(id) {
	return id.replace('\\u2323', "").replace('\\u2323', "");
}

BidHelper.checkRight = function(rightName, bitRights) {
	
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

/**
 * Convert bidowl bit types to list of human readable types
 * @param {Byte} type Type converted as Byte
 */
BidHelper.convertType = function(type) {

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

BidHelper.getTypes = function(type) {
	return BidHelper.convertType(type);
}

BidHelper.getType = function(type) {
	var types = BidHelper.convertType(type);
	if (types.length > 0) {
		return types[types.length-1];
	} else {
		return false;
	}
}


module.exports = {
	"BidConnection" : BidConnection,
	"BidHelper" : BidHelper
};

