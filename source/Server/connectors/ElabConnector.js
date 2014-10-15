"use strict";

var elabConnector=require('./FileConnector.js');

elabConnector.elabConnections = {};
elabConnector.externalSessions = {};

elabConnector.login=function(username,password,externalSession,context, rp){

	var self = this;

	var data={};
	
	var home = "";

	if (externalSession === true) {
		if (self.externalSessions[password] === undefined) rp(false);
		home = self.externalSessions[password].home;
		password = self.externalSessions[password].password; //get real password from external session
	} else {
		var crypto = require('crypto')
		var hash = crypto.createHash('sha1');
		hash.update(this.Modules.Config.elab.encryptionKey+password);
		password = hash.digest('hex');
	}

	var fs = require('fs');
	var filebase = this.Modules.Config.elab.filebase;
	var filename=filebase+'/users/'+username+'.user.txt';
	
	try {
		var attributes = fs.readFileSync(filename, 'utf8');
		attributes=JSON.parse(attributes);
	} catch (e) {
		rp(false);
		return;
	}
	
	if (attributes.password === password) {

		self.Modules.Log.debug("Login successful for user '"+username+"'");
			
		var data={};

		data.username=username;
		data.password=password;
		if (home != "") {
			data.home =  home;
		} else {
			data.home = attributes.room;
		}

		self.elabConnections[context.socket.id] = username;
			
		rp(data);
			
	} else {
		/* login failed */
		self.Modules.Log.debug("Login failed for user '"+username+"'");
		rp(false);
	}	
}

elabConnector.isLoggedIn=function(context) {
	return (this.elabConnections[context.socket.id] !== undefined);
}


elabConnector.addExternalSession=function(data) {
	this.externalSessions[data.id] = data;
}

/* RIGHTS */

elabConnector.mayWrite=function(roomID,objectID,connection,callback) {
	this.Modules.Log.debug("Check right: write (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(connection)+"')");

	var self = this;
	
	var fs = require('fs');
	var filebase = this.Modules.Config.elab.filebase;
	var username = connection.user.username;

	if (roomID === username) {
		callback(null, true);
		return;
	}

	var filename=filebase+'/courses/'+roomID+'/verified/'+username+'.txt';

	fs.exists(filename, function(exists) {
		if (exists) {
		  	var rights = fs.readFileSync(filename, 'utf8');
		  	if (rights === 'write') {
		  		callback(null, true);
		  	} else {
		  		callback(null, false);
		  	}
		} else {
			self.getRoomData(roomID, connection, function(obj) { 
				if (obj.attributes.parent !== undefined) {
					self.mayWrite(obj.attributes.parent, null, connection, callback);
		  		} else {
		  			callback(null, false);
		  		}
		  	});
		}
	});
}

elabConnector.mayRead=function(roomID,objectID,connection,callback) {
	this.Modules.Log.debug("Check right: read (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(connection)+"')");
	
	var self = this;
	
	var fs = require('fs');
	var filebase = this.Modules.Config.elab.filebase;
	var username = connection.user.username;

	if (roomID === username) {
		callback(null, true);
		return;
	}

	var filename=filebase+'/courses/'+roomID+'/verified/'+username+'.txt';

	fs.exists(filename, function(exists) {
		if (exists) {
		  	callback(null, true);
		} else {
			var obj = self.getObjectDataByFile(roomID, roomID);
			if (obj) {
				if (obj.attributes.parent !== undefined) {
					self.mayRead(obj.attributes.parent, null, connection, callback);
		  		} else {
		  			callback(null, false);
		  		}
		  	} else {
		  		// subroom, room object does not exist yet (it is created when it is first entered)
		  		callback(null, true);
		  	}
		}
	});
}

elabConnector.mayDelete=function(roomID,objectID,connection,callback) {
	this.mayWrite(roomID, null, connection, callback);
}

elabConnector.mayEnter=function(roomID,connection,callback) {
	this.mayRead(roomID, null, connection, callback);
}

elabConnector.mayInsert=function(roomID,connection,callback) {
	this.mayWrite(roomID, null, connection, callback);
}

module.exports=elabConnector;