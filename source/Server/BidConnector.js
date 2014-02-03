"use strict";

var bidConnector=require('./FileConnector.js');

bidConnector.bidConnections = {};
bidConnector.bidRights = {};

bidConnector.externalSessions = {};

bidConnector.login=function(username,password,externalSession,context, rp){

	var self = this;

	var data={};
	
	if (externalSession === true) {
		if (self.externalSessions[password] === undefined) rp(false);
		password = self.externalSessions[password].password; //get real password from external session
		delete(self.externalSessions[password]);
	}
	
	var protocol = (global.config.bidServerIsHttps)?'https':'http';

	var BidConnection = require('./BidAPI.js').BidConnection;
	self.bidConnections[context.socket.id] = new BidConnection(protocol,global.config.bidServer, global.config.bidPort, username, password);

	self.bidConnections[context.socket.id].checkLogin(function(loggedIn) {
	
		if (loggedIn) {

			self.Modules.Log.debug("Login successfull for user '"+username+"'");
			
			var data={};

			data.username=username;
			data.password=password;
			data.home = undefined;
			
			rp(data);
			
		} else {
			/* login failed */
			self.Modules.Log.debug("Login failed for user '"+username+"'");
			rp(false);
		}
		
	});
	
}

bidConnector.isLoggedIn=function(context) {
	return (this.bidConnections[context.socket.id] !== undefined);
}



bidConnector.addExternalSession=function(data) {
	this.externalSessions[data.id] = data;
}


/* RIGHTS */

bidConnector.mayAnything=function(roomID, connection, callback) {
	
	if (this.bidRights[connection.socket.id] == undefined) {
		this.bidRights[connection.socket.id] = {};
	}
	
	if (this.bidRights[connection.socket.id][roomID] !== undefined) {
		this.Modules.Log.debug("Got right from cache (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(connection)+"')");
		callback(null, this.bidRights[connection.socket.id][roomID]);
		return;
	}
	
	var self = this;

	//TODO: check if room is webarena
	this.bidConnections[connection.socket.id].Object.checkRight(roomID, "write", function(resp) {
	
		self.Modules.Log.debug("Got right from bid server (not cached) (roomID: '"+roomID+"', user: '"+self.Modules.Log.getUserFromContext(connection)+"')");
	
		resp = parseInt(resp);
		if (resp == 1) {
			self.bidRights[connection.socket.id][roomID] = true; //cache rights
			callback(null, true);
		} else {
			self.bidRights[connection.socket.id][roomID] = false; //cache rights
			callback(null, false);
		}
		
	});
	
}

bidConnector.mayWrite=function(roomID,objectID,connection,callback) {
	this.Modules.Log.debug("Check right: write (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(connection)+"')");
	this.mayAnything(roomID, connection, callback);
}

bidConnector.mayRead=function(roomID,objectID,connection,callback) {
	this.Modules.Log.debug("Check right: read (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(connection)+"')");
	this.mayAnything(roomID, connection, callback);
}

bidConnector.mayDelete=function(roomID,objectID,connection,callback) {
	this.Modules.Log.debug("Check right: delete (roomID: '"+roomID+"', objectID: '"+objectID+"', user: '"+this.Modules.Log.getUserFromContext(connection)+"')");
	this.mayAnything(roomID, connection, callback);
}

bidConnector.mayEnter=function(roomID,connection,callback) {
	this.Modules.Log.debug("Check right: enter (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(connection)+"')");
	this.mayAnything(roomID, connection, callback);
}

bidConnector.mayInsert=function(roomID,connection,callback) {
	this.Modules.Log.debug("Check right: insert (roomID: '"+roomID+"', user: '"+this.Modules.Log.getUserFromContext(connection)+"')");
	this.mayAnything(roomID, connection, callback);
}


module.exports=bidConnector;