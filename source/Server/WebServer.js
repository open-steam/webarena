/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var Modules=false;

var WebServer={};
var _ = require('underscore');

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
	  var agent=req.headers['user-agent'];
	  
	  if(agent.indexOf('MSIE')>0){
	  		res.writeHead(200, {'Content-Type': 'text/html', 'Content-Disposition': 'inline'});
			data = '<h1>WebArena does not work with Microsoft Internet Explorer</h1><p>This is experimental software. Please use the most recent versions of Firefox or Chrome.</p>';
			res.end(data);
			return;
	  }
	
		/* get userHash */
		var userHashIndex = url.indexOf("/___");
		if (userHashIndex > -1) {
			/* userHash found */
			
			var userHash = url.slice(userHashIndex+1);
			url = url.slice(0, userHashIndex);
			
			var context = Modules.UserManager.getConnectionByUserHash(userHash);
			
		} else {
			var userHash = false;
			var context = false;
		}
			
	  
	  if (url=='/') url=Modules.config.homepage;
	  
	  if (url.substr(0,6)=='/room/') {
		/* open room */

			try {
		
				var roomId = url.substr(6);

				var indexFilename = '/../Client/guis/desktop/index.html';

				fs.readFile(__dirname + indexFilename, 'utf8', function (err, data) {

				    	if (err) {
				      		res.writeHead(404);
							Modules.Log.warn("Error loading index file ("+url+")");
				      		return res.end('404 Error loading index file');
				    	}

						res.writeHead(200, {'Content-Type': 'text/html', 'Content-Disposition': 'inline'});

						data = data.replace("##START_ROOM##", roomId);

						res.end(data);
				  });
		
			} catch(err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}
		
		return;
	  }
	
	
	  // Object Icons
	  if (url.substr(0,12)=='/objectIcons'){
	
	  		try {
	
				var objectType=url.substr(13);
				
				var separator=objectType.indexOf('/');
				
				if (separator>0) {
					
					var section = objectType.substring(separator+1);
					objectType=objectType.substring(0,separator);
					
				} else var section=false;

				var obj=Modules.ObjectManager.getPrototype(objectType);

			  	if (!obj){
			  		  res.writeHead(404);
				      return res.end('Object not found '+objectType);
			  	}	  	

			  	fs.readFile(obj.localIconPath(section),
				  function (err, data) {
				    if (err) {
				      res.writeHead(404);
					  Modules.Log.warn('Icon file is missing for '+objectType+" ("+url+")");
				      return res.end('Icon file is missing for '+objectType);
				    }

				    res.writeHead(200, {'Content-Type': 'image/png','Content-Disposition': 'inline'});
				    res.end(data);
				  });
	  	
			} catch(err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}
	
	  	return;
	  }
	  
	  // setContent
	  
	  else if (url.substr(0,11)=='/setContent' && req.method.toLowerCase() == 'post'){

			try {
	
				var ids=url.substr(12).split('/');
			  	var roomID=ids[0];
			  	var objectID=ids[1];

				var object=Modules.ObjectManager.getObject(roomID,objectID,context);

			  	if (!object){
			  		  res.writeHead(404);
					  Modules.Log.warn('Object not found (roomID: '+roomID+' objectID: '+objectID+')');
				      return res.end('Object not found');
			  	}



				var formidable = require('formidable');
				var util = require('util');

				var form = new formidable.IncomingForm();

				form.parse(req, function(err, fields, files) {

						object.copyContentFromFile(files.file.path, function() {

							object.set('hasContent',true);
							object.set('contentAge',new Date().getTime());
							object.set('mimeType',files.file.type);

							/* check if content is inline displayable */
							if (Modules.Connector.isInlineDisplayable(files.file.type)) {

								object.set('preview',true);

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

								}, files.file.type,true);

							} else {
								object.set('inline',false);

								//send object update to all listeners
								object.persist();
								object.updateClients('contentUpdate');

								res.writeHead(200);
								res.end();
							}


						});

				});
		
			} catch(err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}
		
	  	return;
	  }
	  
	  // getContent

	  else if (url.substr(0,11)=='/getContent'){

	  	try {
		
			var ids=url.substr(12).split('/');
		  	var roomID=ids[0];
		  	var objectID=ids[1];
		  	var object=Modules.ObjectManager.getObject(roomID,objectID,context);

		  	if (!object){
		  		  res.writeHead(404);
				  Modules.Log.warn('Object not found (roomID: '+roomID+' objectID: '+objectID+')');
			      return res.end('Object not found');
		  	}

		  	var mimeType = object.getAttribute('mimeType') || 'text/plain';

		  	var data=object.getContent();
		  	res.writeHead(200, {
                  'Content-Type': mimeType,
                  'Content-Disposition': 'inline; filename="'+ object.getAttribute("name") + '"'

            });

			res.end(new Buffer(data));
		
		} catch(err) {
			res.writeHead(500, {"Content-Type": "text/plain"});
			res.write("500 Internal Server Error");
			res.end();
			Modules.Log.error(err);
		}
		
	  	return;
	  }
	
	
	// getPreviewContent

	  else if (url.substr(0,18)=='/getPreviewContent'){
		
			try {
		
	  			var ids=url.substr(19).split('/');
			  	var roomID=ids[0];
			  	var objectID=ids[1];
			  	var object=Modules.ObjectManager.getObject(roomID,objectID,context);

			  	if (!object){
			  		  res.writeHead(404);
				      return res.end('Object not found');
			  	}

				object.getInlinePreviewMimeType(function(mimeType) {

					object.getInlinePreview(function(data) {

						if (!data) {
							
							Modules.Log.warn('no inline preview found (roomID: '+roomID+' objectID: '+objectID+')');

							if (mimeType.indexOf("image/") >= 0) {

								fs.readFile(__dirname+'/../Client/guis.common/images/imageNotFound.png', function (err, data) {

									if (err) {
										res.writeHead(404);
										Modules.Log.warn("Error loading imageNotFound.png file ("+url+")");
										return res.end('404 Error loading imageNotFound.png file');
									}

									res.writeHead(200, {'Content-Type': 'image/png', 'Content-Disposition': 'inline'});
									res.end(data);
										
								});
								
							} else {
								res.writeHead(404);
								res.end('Object not found');
							}
							
						} else {
							res.writeHead(200, {'Content-Type': 'text/plain', 'Content-Disposition': 'inline'});
							res.end(new Buffer(data));
						}

					},mimeType,true);

				});
		
			} catch(err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

	  	return;
	  }
	
	  //get external session data
	
	  else if (url=='/pushSession' && req.method.toLowerCase() == 'post'){
	
			var qs = require('querystring');
			var data = '';
			req.on('data', function(chunk) {
			  data += chunk;
			});
			req.on('end', function() {
			  	var post = qs.parse(data);
			
				if (Modules.Connector.addExternalSession !== undefined) {
					Modules.Connector.addExternalSession({
						"id" : post.id,
						"username" : post.username,
						"password" : post.password
					});
				}
			
			});
		
	  }

      else if(url =='/defaultJavascripts'){

          //combine all javascript files in guis.common/javascript
          var files=fs.readdirSync('Client/guis.common/javascript');
          files.sort();
          var fileReg = /[0-9]+\.[a-zA-Z]+\.js/;

          files = _.filter(files, function(fname){
             return fileReg.test(fname);
          })

          var combinedJavascript = "";

          //Asynchron file loading!
          //In order to get right order, second file is loaded in the callback of first file
          //and so on.
          var processFiles = function (){

              // check for termination - we worked through all files
              // then we want to send the result.
              if(files.length === 0) sendResult()
              // take first element - call recursion with remaining files,
              // after first file was loaded.
              else {
                  var filename = files.shift();

                  fs.readFile('Client/guis.common/javascript/' + filename, function(err,data){
                      if(!err)  combinedJavascript += data + "\n";

                      processFiles()
                  });
              }

          }

          var sendResult = function(){
              var mimeType='application/javascript';

              res.writeHead(200, {'Content-Type':mimeType});
              res.end(combinedJavascript);
          }

          processFiles();

      }
	  
	  // objects
	  
	  else if (url=='/objects'){
	    
			try {
	
				var code=Modules.ObjectManager.getClientCode();
	    
	    		var mimeType='application/javascript';
	  
	  			res.writeHead(200, {'Content-Type':mimeType});
				res.end(code);
		
			} catch(err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}
		
	  } else {
		 
		  	// plain files

		  	try {
			
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
						Modules.Log.warn('Error loading '+url);
				      	return res.end('Error loading '+url);				      
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
						Modules.Log.warn('WebServer ERROR: No content type for '+url);
						contentType='text/plain';
					}

					res.writeHead(200, {'Content-Type': contentType, 'Content-Disposition': 'inline'});

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
			
			} catch(err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}
	
	  }
		
		
		
	}  // handler
	
	
	
};

module.exports=WebServer;