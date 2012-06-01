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
		Modules.Connector.trimImage(self.inRoom, self.id, function(dX, dY, newWidth, newHeight) {
			
			if (dX) {
				/* set new dimensions */

				self.setAttribute("x", parseInt(self.data.x)+parseInt(dX));
				self.setAttribute("y", parseInt(self.data.y)+parseInt(dY));
				self.setAttribute("width", parseInt(newWidth));
				self.setAttribute("height", parseInt(newHeight));
				
			}

			if (callback) callback(); //callback of setContent
			
			self.data.hasContent=!!content;
			self.data.contentAge=new Date().getTime();

			//send object update to all listeners
			self.persist();
			self.updateClients('contentUpdate');
		
		},self.context);
		
	},self.context);
	
}