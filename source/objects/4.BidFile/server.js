/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.commonRegister = theObject.register;
theObject.register = function(type) {
	theObject.commonRegister(type);

	Modules.Dispatcher.registerCall('bidFile-browse', function(socket, data, responseID){
    	var context=Modules.UserManager.getConnectionBySocket(socket);
        var roomID=data.roomID
        var objectID=data.objectID;
    	var browseLocation = data.browseLocation || null;
	
	    var object=Modules.ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
		}

		Modules.Connector.mayRead(roomID, objectID, context, function(err, mayRead) {

			if (mayRead) {

				var object=Modules.ObjectManager.getObject(roomID,objectID,context);
				if (!object){
					Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
					return;
				}

				var responseCallback = function(res){
		            console.log('Send browse results to client.');
		            Modules.Dispatcher.respond(socket,responseID,res);
		        };

			    var browseParams = {
			        location : browseLocation,
			        callback : responseCallback,
					connection : context
			    };

		        object.browse(browseParams);

			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
			}

		});
		
    });


	Modules.Dispatcher.registerCall('bidFile-setFile', function(socket, data, responseID){
    	var context=Modules.UserManager.getConnectionBySocket(socket);
        var roomID=data.roomID
        var objectID=data.objectID;
    	var bidObjectId = data.bidObjectId;
	
	    var object=Modules.ObjectManager.getObject(roomID,objectID,context);
		if (!object){
			return Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
		}

		Modules.Connector.mayRead(roomID, objectID, context, function(err, mayRead) {

			if (mayRead) {

				var object=Modules.ObjectManager.getObject(roomID,objectID,context);
				if (!object){
					Modules.SocketServer.sendToSocket(socket,'error','Object not found '+objectID);
					return;
				}

		        object.setFile(bidObjectId, socket, function(data) {
					Modules.Dispatcher.respond(socket,responseID,data);
				});

			} else {
				Modules.SocketServer.sendToSocket(socket,'error','No rights to read '+objectID);
			}

		});
		
    });
	
}

theObject.browse = function(data) {

	var self = this;
	
	if (data.location) {
		var location = data.location;
	} else {

		/* no id provided --> get workroom ID */
		Modules.Connector.bidConnections[data.connection.socket.id].User.getMyWorkroom(function(workRoom) {
			
			var BidHelper = require('../../Server/BidAPI.js').BidHelper;
			var id = BidHelper.convertId(workRoom.index);
			
			data.location = id;
			self.browse(data);
			
		});
		return;
		
	}
	
	Modules.Connector.bidConnections[data.connection.socket.id].Container.getInventory(location, function(resp) {	

		var r = [];
		
		var BidHelper = require('../../Server/BidAPI.js').BidHelper;
		
		if (!resp || resp.length == null) {
			data.callback([]); return;
		}
		
		var CallbackCollector = require("../../Server/CallbackCollector.js");
		var collector = new CallbackCollector(resp.length, function() {
			/* getObjectById for all objects finished */
			data.callback(r);
		});
		
		for (var i in resp) {
			var id = BidHelper.convertId(resp[i]);
			
			/* get object information */
			Modules.Connector.bidConnections[data.connection.socket.id].Object.getObjectById(id, function(resp) {
			
				var types = BidHelper.convertType(resp.type);
				var attributes = resp.object.objects[resp.id].attributes;
			
				r.push({
					"id" : resp.id,
					"attributes" : attributes,
					"types" : types
				});
				
				collector.call();
			
			});
			
		}

	});
	
}


theObject.setFile = function(bidObjectId, socket, callback) {
	var self = this;

	Modules.Connector.bidConnections[socket.id].Object.getObjectById(bidObjectId, function(resp) {
		
		var mimeType = resp.object.objects[resp.id].attributes.DOC_MIME_TYPE;
		
		Modules.Connector.bidConnections[socket.id].Document.getContent(bidObjectId, function(data) {

			self.setContent(data, function() {
				
				self.set('mimeType',mimeType);
				self.set('hasContent',true);
				self.set('contentAge',new Date().getTime());

				/* check if content is inline displayable */
				if (Modules.Connector.isInlineDisplayable(mimeType)) {

					self.set('preview',true);

					self.persist();

					/* get dimensions */
					Modules.Connector.getInlinePreviewDimensions(self.get('inRoom'), self.id, mimeType, true, function(width, height) {

						if (width != false)	self.setAttribute("width", width);
						if (height != false) self.setAttribute("height", height);

						//send object update to all listeners
						self.persist();
						self.updateClients('contentUpdate');
						
						callback();

					});

				} else {
					self.set('inline') = false;

					//send object update to all listeners
					self.persist();
					self.updateClients('contentUpdate');
					
					callback();

				}
				
			});

		});
		
	});

}