/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

"use strict";

var Modules = false;

var WebServer = {};
var _ = require('lodash');
var mime = require('mime');
mime.default_type = 'text/plain';
var Q = require('q');

/*
 *	init
 *
 *	starts the webserver
 */
WebServer.init = function (theModules) {

	Modules = theModules;

	var app = require('http').createServer(handler),
			fs = require('fs');

	WebServer.server = app;



	app.listen(Modules.config.port);  // start server (port set in config)

	function handler(req, res) {
		var url = req.url.replace('%20', ' ');
		var agent = req.headers['user-agent'];


		if (!Modules.config.debugMode && agent && (agent.indexOf('Trident') > 0 || agent.indexOf('Edge') > 0)) {
			res.writeHead(200, {'Content-Type': 'text/html', 'Content-Disposition': 'inline'});
			data = '<h1>WebArena does not work with Microsoft Internet Explorer or Microsoft Edge</h1><p>This is experimental software. Please use the most recent versions of Firefox or Chrome.</p>';
			res.end(data);
			return;
		}
	
		
		/* get userHash */
		var userHashIndex = url.indexOf("/___");
		if (userHashIndex > -1) {
			/* userHash found */

			var userHash = url.slice(userHashIndex + 1);
			url = url.slice(0, userHashIndex);

			var context = Modules.UserManager.getConnectionByUserHash(userHash);
			if (!context){
				console.log('UserHash has expired or could not be found '+userHash);
				userHash = false;
			}

		} else {
			var userHash = false;
			var context = false;
		}


		if (url == '/') url = Modules.config.homepage;


		if (url.substr(0, 6) == '/room/') {
			/* open room */

			try {

				var roomId = url.substr(6);

				var indexFilename = '/../Client/guis/desktop/index.html';
				var impressumFilename = '/../Client/guis/desktop/impressum.html';
				fs.readFile(__dirname + indexFilename, 'utf8', function (err, data) {

					if (err) {
						res.writeHead(404);
						Modules.Log.warn("Error loading index file (" + url + ")");
						return res.end('404 Error loading index file');
					}

					res.writeHead(200, {'Content-Type': 'text/html', 'Content-Disposition': 'inline'});

					data = data.replace("##START_ROOM##", roomId);

					res.end(data);
				});

			} catch (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

			return;
		}

        // roomlist
        if (url.substr(0, 9) == "/getRooms") {

			Modules.RoomController.listRooms(function(err, rooms){
			
				if(err){
					console.log("Error during listRooms");
				}
				else{
					res.writeHead(200, {'Content-Type': "application/json"});
					res.end(JSON.stringify(rooms));
				}
			});
		
			return;

        }


		// Object Icons
		if (url.substr(0, 12) == '/objectIcons') {

			try {

				var objectType = url.substr(13);

				var separator = objectType.indexOf('/');

				if (separator > 0) {

					var section = objectType.substring(separator + 1);
					objectType = objectType.substring(0, separator);

				} else var section = false;

				var obj = Modules.ObjectManager.getPrototype(objectType);

				if (!obj) {
					res.writeHead(404);
					return res.end('Object not found ' + objectType);
				}

				fs.readFile(obj.localIconPath(section),
						function (err, data) {
							if (err) {
								res.writeHead(404);
								Modules.Log.warn('Icon file is missing for ' + objectType + " (" + url + ")");
								return res.end('Icon file is missing for ' + objectType);
							}

							res.writeHead(200, {'Content-Type': 'image/png', 'Content-Disposition': 'inline'});
							res.end(data);
						});

			} catch (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

			return;
		}

		// Category Icons
		if (url.substr(0, 14) == '/categoryIcons') {

			try {

				var category = url.substr(15);

				var path = __dirname + '/../objects/' + category + '/icon.png';
				
				if (!fs.existsSync(path)) {
					res.writeHead(404);
					return res.end('Object not found ' + category);
				}

				fs.readFile(path,
						function (err, data) {
							if (err) {
								res.writeHead(404);
								Modules.Log.warn('Icon file is missing for ' + objectType + " (" + url + ")");
								return res.end('Icon file is missing for ' + objectType);
							}

							res.writeHead(200, {'Content-Type': 'image/png', 'Content-Disposition': 'inline'});
							res.end(data);
						});

			} catch (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

			return;
		}


		// setContent

		else if (url.substr(0, 11) == '/setContent' && req.method.toLowerCase() == 'post') {

			try {

				var ids = url.substr(12).split('/');
				var roomID = ids[0];
				var objectID = ids[1];

				var object = Modules.ObjectManager.getObject(roomID, objectID, context);
				var historyEntry = {
					'objectID' : objectID,
					'roomID' : roomID,
					'action' : 'set Content'
				}
				
				Modules.ObjectManager.history.add(new Date().getTime(), context.user.username, historyEntry);
				Modules.RoomController.informAllInRoom({"room": roomID, 'message': {'change': 'change'}}, null); 
				
				if (!object) {
					res.writeHead(404);
					Modules.Log.warn('Object not found (roomID: ' + roomID + ' objectID: ' + objectID + ')');
					return res.end('Object not found');
				}


				var formidable = require('formidable');
				var util = require('util');

				var form = new formidable.IncomingForm();
					
				form.parse(req, function (err, fields, files) {
													
					object.copyContentFromFile(files.file.path, function() {
														
						object.set('hasContent', true);
						object.set('contentAge', new Date().getTime());
						object.set('mimeType', files.file.type);
								
						/* check if content is inline displayable */
						if (Modules.Connector.isInlineDisplayable(files.file.type)) {

							object.persist();

							/* get dimensions */
							Modules.Connector.getInlinePreviewDimensions(roomID, objectID, files.file.type, true, function (width, height) {

								if (width != false)    object.setAttribute("width", width);
								if (height != false) object.setAttribute("height", height);

								//send object update to all listeners
								object.persist();
								object.updateClients('contentUpdate');

								res.writeHead(200);
								res.end();

							});

						} else {

							//send object update to all listeners
							object.persist();
							object.updateClients('contentUpdate');

							res.writeHead(200);
							res.end();
						}
						
						
						/* Restrict the uploaded file size, the maximum filesize is spezified in the config */
						var filesize = files.file.size; 
						if(Modules.Config.maxFilesizeInMB*1000000<filesize){
							fs.unlinkSync(files.file.path);
							
							//delete the object after waiting for a couple of time to avoid deleting an unfinished object
							setTimeout(function(){Modules.ObjectManager.remove(object)},3000);		
						}	
														
					});
												
				});
				
			} catch (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}
	
			return;
		}

		// getContent
		
		else if (url.substr(0, 11) == '/getContent') {
			try {
			
				var ids = url.substr(12).split('/');
				var roomID = ids[0];
				var objectID = ids[1];
				var object = Modules.ObjectManager.getObject(roomID, objectID, context);

				if (!object) {
					res.writeHead(404);
					Modules.Log.warn('Object not found (roomID: ' + roomID + ' objectID: ' + objectID + ')');
					return res.end('Object not found');
				}

				var mimeType = object.getAttribute('mimeType') || 'text/plain';
				
				if (mimeType == 'application/x-pdf') mimeType = 'application/pdf';  //fix inline pdf preview
				
				res.writeHead(200, {
					'Content-Type': mimeType,
					'Content-Disposition': 'inline; filename="' + object.getAttribute("name") + '"'
				});
			
				if(Modules.Connector.getContentStream !== undefined){
					var objStream = Modules.Connector.getContentStream(roomID, objectID, context);
					objStream.pipe(res);
					objStream.on("end", function(){
						res.end();
					})
				} else {
					var data = object.getContent();
					res.end(new Buffer(data));
				}

			} catch (err) {

				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

			return;
		}

		
		// getDownload

		else if (url.substr(0, 12) == '/getDownload') {
			try {
			
				var ids = url.substr(13).split('/');
				var roomID = ids[0];
				var objectID = ids[1];
				var object = Modules.ObjectManager.getObject(roomID, objectID, context);

				if (!object) {
					res.writeHead(404);
					Modules.Log.warn('Object not found (roomID: ' + roomID + ' objectID: ' + objectID + ')');
					return res.end('Object not found');
				}

				var mimeType = object.getAttribute('mimeType') || 'text/plain';

				res.writeHead(200, {
					'Content-Type': 'application/force-download',
					'Content-Disposition': 'attachment; filename="' + object.getAttribute("name") + '"'
				});
				
				if(Modules.Connector.getContentStream !== undefined){
					var objStream = Modules.Connector.getContentStream(roomID, objectID, context);
					objStream.pipe(res);
					objStream.on("end", function(){
						res.end();
					})
				} else {
					var data = object.getContent();
					res.end(new Buffer(data));
				}

			} catch (err) {

				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

			return;
		}
		
		
		// getPreviewContent

		else if (url.substr(0, 18) == '/getPreviewContent') {

			try {

				var ids = url.substr(19).split('/');
				var roomID = ids[0];
				var objectID = ids[1];
				var object = Modules.ObjectManager.getObject(roomID, objectID, context);

				if (!object) {
					res.writeHead(404);
					return res.end('Object not found');
				}

				object.getInlinePreviewMimeType(function (mimeType) {

					object.getInlinePreview(mimeType, function (data) {

						if (!data) {

							if (mimeType != false){
						
								Modules.Log.warn('no inline preview found (roomID: ' + roomID + ' objectID: ' + objectID + ')');
							
								if(mimeType.indexOf("image/") >= 0) {

									fs.readFile(__dirname + '/../Client/guis.common/images/imageNotFound.png', function (err, data) {

										if (err) {
											res.writeHead(404);
											Modules.Log.warn("Error loading imageNotFound.png file (" + url + ")");
											return res.end('404 Error loading imageNotFound.png file');
										}

										res.writeHead(200, {'Content-Type': 'image/png', 'Content-Disposition': 'inline'});
										res.end(data);

									});
								} else {
									res.writeHead(404);
									res.end('Object not found');
								}
							}
						} else {
							res.writeHead(200, {'Content-Type': 'text/plain', 'Content-Disposition': 'inline'});
							res.end(new Buffer(data));
						}

					});

				});

			} catch (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

			return;
		}

		//get external session data

		else if (url == '/pushSession' && req.method.toLowerCase() == 'post') {

			var qs = require('querystring');
			var data = '';
			req.on('data', function (chunk) {
				data += chunk;
			});
			req.on('end', function () {
				var post = qs.parse(data);

				var home = post.home;
				if (!home) {
					home = "";
				}
				if (Modules.Connector.addExternalSession !== undefined) {
					Modules.Connector.addExternalSession({
						"id": post.id,
						"username": post.username,
						"password": post.password,
						"home": home
					});
				}

			});

		}
		
		else if (url == '/defaultJavascripts') {

			//combine all javascript files in guis.common/javascript
			Q.nfcall(fs.readdir, 'Client/guis.common/javascript').then(function(files){
				files.sort(function (a, b) {
					return parseInt(a) - parseInt(b);
				});
				var fileReg = /[0-9]+\.[a-zA-Z]+\.js/;

				files = _.filter(files, function (fname) {
					return fileReg.test(fname);
				})

				var etag = "";


				files.forEach(function (file) {
					var stats = fs.statSync('Client/guis.common/javascript/' + file);
					etag += stats.size + '-' + Date.parse(stats.mtime);
				})

				if (req.headers['if-none-match'] === etag) {
					res.statusCode = 304;
					res.end();
				} else {
					var readFileQ = Q.denodeify(fs.readFile);

					var promises = files.map(function(filename){
						return readFileQ('Client/guis.common/javascript/' + filename)
					})

					var combinedJS = "";

					//Go on if all files are loaded
					Q.allSettled(promises).then(function(results){
						results.forEach(function(result){
							combinedJS += result.value + "\n";
						})

						var mimeType = 'application/javascript';
						res.writeHead(200, {'Content-Type': mimeType,'ETag': etag});
						res.end(combinedJS);
					})
				}
			})
		}

		else if (url == '/time'){
			var currentdate = new Date(); 
			var etag=currentdate.getTime();
			if (req.headers['if-none-match'] === etag) {
					res.statusCode = 304;
					res.end();
			} else {
				var datetime = "Time: " + currentdate.getDate() + "/"
				                + (currentdate.getMonth()+1)  + "/" 
				                + currentdate.getFullYear() + " @ "  
				                + currentdate.getHours() + ":"  
				                + currentdate.getMinutes() + ":" 
				                + currentdate.getSeconds();
				res.writeHead(200, {'ETag': etag});
				res.end(datetime);
			}
		}
		
		else if (url == '/config.js'){
			var obj = JSON.stringify(Modules.ConfigClient);
									
			data="\"use strict\";"+"\n"+"\n"+"var Config="+obj+';';	
			
			res.end(data);
		}

		// objects

		else if (url == '/objects') {

			try {
				var code = Modules.BuildTool.getClientCode();
				var mimeType = 'application/javascript';

				res.writeHead(200, {'Content-Type': mimeType});
				res.end(code);

			} catch (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

		}

		// else if(url == "/applications"){
		// 	try {
		// 		Modules.ApplicationManager.getApplicationGuiElements(function(err, callback){
		// 			var mimeType = 'application/javascript';

		// 			res.writeHead(200, {'Content-Type': mimeType});

		// 			var output = "";
		// 			for(let data in callback){
		// 				output += callback[data];
		// 			}
		// 			var data = {peter: "lol"};
		// 			res.end("Modules.ApplicationManager.setApplicationGuiData("+JSON.stringify(callback)+")");
		// 		});
		// 	}
				
		// 	 catch (err) {
		// 		res.writeHead(500, {"Content-Type": "text/plain"});
		// 		res.write("500 Internal Server Error");
		// 		res.end();
		// 		Modules.Log.error(err);
		// 	}
		// }


		else if (url.substr(0, 10) !== "/socket.io") {

			// plain files

			try {
			
				var urlParts = url.split('/');
				
				var filebase;
				
				filebase = __dirname + '/../Client';
				
				var filePath = filebase + url;
				
				if (urlParts.length > 2) {
					switch (urlParts[1]) {
						case 'Common':
							filebase = __dirname + '/..';
							filePath = filebase + url;
							break;
					}
				}

				fs.readFile(filePath,
						function (err, data) {
							if (err) {
								res.writeHead(404);
								Modules.Log.warn('Error loading ' + url);
								return res.end('Error loading ' + url);
							}

							fs.stat(filePath, function (err, stat) {
								if (err) {
									res.statusCode = 500;
									res.end()
								} else {
									var etag = stat.size + '-' + Date.parse(stat.mtime);


									if (req.headers['if-none-match'] === etag) {
										res.statusCode = 304;
										
										res.end();
									} else {
										var contentType = false;

										contentType = mime.lookup(url)

										var shouldSendETag = true;

										var ETagExclude = ["html"];
										_(ETagExclude).each(function(toExcludeS){
											if(url.length >= toExcludeS.length && url.substr(url.length - toExcludeS.length) == toExcludeS) shouldSendETag = false;
										})

										var head = {
											'Content-Type': contentType,
											'Content-Disposition': 'inline',
											'Last-Modified': stat.mtime
										}
										if(shouldSendETag){
											head['ETag'] = etag;
											head['Content-Length'] =  data.length
										}
										res.writeHead(200, head);
										
										if (url.search(".html") !== -1) {
											data = data.toString('utf8');
											var position1 = data.search('<serverscript');
											if (position1 != -1) {
												var src = data;
												src = src.substr(position1);

												var position2 = src.search('"') + 1;
												src = src.substr(position2);

												var position3 = src.search('"');
												src = src.substr(0, position3);


												var pre = data.substr(0, position1);
												var post = data.substr(position1 + position2 + position3 + 2);

												var theScript = require('./scripts/' + src);

												theScript.run(url);
												var result = theScript.export;

												data = pre + result + post;

											}
										}


										res.end(data);
									}
								}
							})

						});

			} catch (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.write("500 Internal Server Error");
				res.end();
				Modules.Log.error(err);
			}

		}

		
	}  // handler


};

module.exports = WebServer;