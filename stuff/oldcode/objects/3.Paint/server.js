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


/**
*	setContent
*
*	set a new content. If the content is base64 encoded png data,
*	it is decoded first.
*/
theObject.setContent=function(content,callback){
	
	var self = this;
	
	if (content.substr(0,22)=='data:image/png;base64,'){
		
		var base64Data = content.replace(/^data:image\/png;base64,/,""),
		content = new Buffer(base64Data, 'base64');
	}

	Modules.Connector.saveContent(this.inRoom, this.id, content, function() {
		
		/* trim image (remove transpartent "border") */
		Modules.Connector.trimImage(self.inRoom, self.id, self.context, function(dX, dY, newWidth, newHeight) {

			if (newWidth == 1 && newHeight == 1) {
				console.log("IMAGE #"+self.id+" HAS NO CONTENT --> DELETE IT");
				self.deleteIt();
				return;
			}
			
			if (dX) {
				/* set new dimensions */

				self.setAttribute("x", parseInt(self.get('x'))+parseInt(dX));
				self.setAttribute("y", parseInt(self.get('y'))+parseInt(dY));
				self.setAttribute("width", parseInt(newWidth));
				self.setAttribute("height", parseInt(newHeight));
				
			}

			if (callback) callback(); //callback of setContent
			
			self.set('hasContent',!!content);
			self.set('contentAge',new Date().getTime());

			//send object update to all listeners
			self.persist();
			self.updateClients('contentUpdate');
		
		});
		
	},self.context);
	
}
theObject.setContent.public = true;
theObject.setContent.neededRights = {
    write : true
}