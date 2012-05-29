/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var Modules=false;

var WebServer={};

/*
*	init
*
*	starts the webserver
*/
WebServer.init=function(theModules){
	
	Modules=theModules;
	
	var app = require('http').createServer(handler),
		fs = require('fs');
	
	WebServer.server=app;
	 
	app.listen(global.config.port);  // start server (port set in config)

	function handler (req, res) {
	  var url=req.url.replace('%20',' ');	
	  
	  if (url=='/') url='/index.html';
	  
	  // Object Icons
	  
	  if (url.substr(0,12)=='/objectIcons'){
	  	var objectType=url.substr(13);
	  	
	  	var obj=Modules.ObjectManager.getPrototype(objectType);
	  	
	  	if (!obj){
	  		  res.writeHead(404);
		      return res.end('Object not found '+objectType);
	  	}	  	
	  	
	  	fs.readFile(obj.localIconPath,
		  function (err, data) {
		    if (err) {
		      res.writeHead(404);
		      return res.end('Icon file is missing for '+objectType);
		      console.log('Icon file is missing for '+objectType);
		    }
		
		    res.writeHead(200, {'Content-Type': 'image/png','Content-Disposition': 'inline'});
		    res.end(data);
		  });
	  	
	  	return;
	  }
	  
	  // setContent
	  
	  else if (url.substr(0,11)=='/setContent' && req.method.toLowerCase() == 'post'){
	  	
		var ids=url.substr(12).split('/');
	  	var roomID=ids[0];
	  	var objectID=ids[1];
	
		var object=Modules.ObjectManager.getObject(roomID,objectID);
	  	
	  	//TODO rights check (Idea: provide connection id)
	  	
	  	if (!object){
	  		  res.writeHead(404);
		      return res.end('Object not found');
	  	}
	
		var fileName = Modules.config.filebase+'/'+roomID+'/'+objectID+'.content';
	
	
	
		var formidable = require('formidable');
		var util = require('util');

		var form = new formidable.IncomingForm();
		    
		form.parse(req, function(err, fields, files) {

				object.copyContentFromFile(files.file.path, function() {
					
					object.data.hasContent = true;
					object.data.contentAge=new Date().getTime();
					object.data.mimeType = files.file.type;

					/* check if content is inline displayable */
					if (Modules.Connector.isInlineDisplayable(files.file.type)) {

						object.data.preview = true;
						
						object.persist();
						
						/* get dimensions */
						Modules.Connector.getInlinePreviewDimensions(roomID, objectID, function(width, height) {

							if (width != false)	object.setAttribute("width", width);
							if (height != false) object.setAttribute("height", height);
							
							//send object update to all listeners
							object.persist();
							object.updateClients('contentUpdate');
							
							res.writeHead(200);
							res.end();
							
						}, files.file.type);
						
					} else {
						object.data.inline = false;

						//send object update to all listeners
						object.persist();
						object.updateClients('contentUpdate');
						
						res.writeHead(200);
						res.end();
					}
		
					
				});
	
		});
		
		
	  	return;
	  }
	  
	  // getContent

	  else if (url.substr(0,11)=='/getContent'){
	  	var ids=url.substr(12).split('/');
	  	var roomID=ids[0];
	  	var objectID=ids[1];
	  	var object=Modules.ObjectManager.getObject(roomID,objectID);

	  	//TODO rights check (Idea: provide connection id)

	  	if (!object){
	  		  res.writeHead(404);
		      return res.end('Object not found');
	  	}

	  	//TODO mime type

	  	var mimeType=object.getAttribute('mimeType') || 'text/plain';

	  	data=object.getContent();
	  	res.writeHead(200, {'Content-Type': mimeType,'Content-Disposition': 'inline'});
		res.end(data);
	  	return;
	  }
	
	
	// getPreviewContent

	  else if (url.substr(0,18)=='/getPreviewContent'){
	  	var ids=url.substr(19).split('/');
	  	var roomID=ids[0];
	  	var objectID=ids[1];
	  	var object=Modules.ObjectManager.getObject(roomID,objectID);

	  	//TODO rights check (Idea: provide connection id)

	  	if (!object){
	  		  res.writeHead(404);
		      return res.end('Object not found');
	  	}

	  	var mimeType=object.getAttribute('mimeType') || 'text/plain';

		object.getInlinePreview(function(data) {
			
			if (!data) {
				res.writeHead(404);
				return res.end('Object not found');
			}
			
		  	res.writeHead(200, {'Content-Type': object.getInlinePreviewMimeType(),'Content-Disposition': 'inline'});
			res.end(data);
				
		},mimeType);

	  	return;
	  }
	  
	  // objects
	  
	  else if (url=='/objects'){
	    var code=Modules.ObjectManager.getClientCode();
	    
	    var mimeType='application/javascript';
	  
	  	res.writeHead(200, {'Content-Type':mimeType});
		res.end(code);
	  } else {
		 
		  // plain files
		 
		  var urlParts=url.split('/');
		  
		  var filebase=__dirname + '/../Client';
		  var filePath=filebase+url;
		  
		  if(urlParts.length>2){
		  	switch(urlParts[1]){
		  		case 'Common':
		  			filebase=__dirname + '/..';
		  			filePath=filebase+url;
		  		break;
		  	}
		  }
		  
		  fs.readFile(filePath,
		  function (err, data) {
		    if (err) {
		      res.writeHead(404);
		      return res.end('Error loading '+url);
		      console.log('WEBSERVER: Error loading '+url);
		    }
		
			var contentType=false;
			
			if (url.indexOf('.m4a')!=-1) contentType='audio/mpeg';
			if (url.indexOf('.png')!=-1) contentType='image/png';
			if (url.indexOf('.jpg')!=-1) contentType='image/jpeg';
			if (url.indexOf('.gif')!=-1) contentType='image/gif';
			if (url.indexOf('.htm')!=-1) contentType='text/html';
			if (url.indexOf('.js')!=-1) contentType='application/javascript';
			if (url.indexOf('.css')!=-1) contentType='text/css';
			
			if (!contentType) {
				console.log('WebServer ERROR: No content type for '+url);
				contentType='text/plain';
			}
		
			res.writeHead(200, {'Content-Type': contentType, 'Content-Disposition': 'inline'});
		
		    
		    //TODO try-catch for scripts
		    
		    if (url.search(".html") != -1){
		    	data=data.toString('utf8');
		    	var position1=data.search('<serverscript');
		    	if (position1!=-1){
		    		var src=data;
		    		src=src.substr(position1);
		    		
		    		var position2=src.search('"')+1;
		    		src=src.substr(position2);
		    		
		    		var position3=src.search('"');
		    		src=src.substr(0,position3);
		    		
		    		var pre=data.substr(0,position1);
		    		var post=data.substr(position1+position2+position3+2);
		    		
		    		var theScript=require('./scripts/'+src);
		    		
		    		theScript.run(url);
		    		
		    		var result=theScript.export;
		    		
		    		data=pre+result+post;
		    		
		    	}
		    };
		    
		    res.end(data);
		  });
		}
		
		
		
	}  // handler
	
	
	
};

module.exports=WebServer;