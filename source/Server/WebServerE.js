/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */
"use strict";

var authenticator = require('./Authentication');

var path = require('path');
var Q = require('q');
var fs = require('fs');
var _ = require('lodash');

var express = require('express');
var Session = require('express-session');                                                                  // half an hour = 1800000
var session = Session({secret: 'keyboard gato', key: 'sid', resave: false, saveUninitialized: false, cookie: { maxAge: 1800000 }});
var checkMobile = require('connect-mobile-detection');
var bodyParser = require('body-parser');
var app = express();

var hbs = require('hbs');
var blocks = {};

var Modules = false;

/**
 * @class WebServer
 * @classdesc Web Server that manages http requests 
 */
var WebServer = {};

/**
 * Init function called in server.js to initialize this module.
 *
 * @param {Object} theModules variable to access the other modules.
 */
WebServer.init = function(theModules) {
    Modules = theModules;

    var server = require('http').createServer(app);
    WebServer.server = server;
    WebServer.session = session;

    server.listen(Modules.config.port); // start server (port set in config file)
};

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

app.use(express.static(path.resolve(__dirname, '../Client')))
    .use('/Common', express.static(path.resolve(__dirname, '../Common')))
    .use('/guis/mobilephone/images', express.static(path.resolve(__dirname, '../Client/views/mobilephone/images')))
    .set('views', path.resolve(__dirname, '../Client/views'))
    .set('view engine', 'html')
    .engine('html', hbs.__express)
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(bodyParser.json())
    .use(checkMobile())
    .use(session) // session support
    .use(authenticator.everyauth.middleware(app));

// invoked for any requested passed to this router
app.use(function(req, res, next) {

    /* Check if the client is on a mobile phone or not. */
    if (req.phone) {
    	req.guiType = 'mobilephone';
	} else {
        // the client is a tablet or a computer
		req.guiType = 'desktop';
	}
	    
    if (req.loggedIn) {

        var context = false;

	    /* get userHash */
	    var userHashIndex = req.path.indexOf("/___");
	    if (userHashIndex > -1) {

		    /* userHash found */
			var userHash = req.path.slice(userHashIndex + 1);
			var context = Modules.UserManager.getConnectionByUserHash(userHash);
	    }

		req.context = context;
		next();
	} else {
		res.redirect('/login');
	}
 
});

app.get('/', function(req, res) {
    var filePath = path.resolve(__dirname, '../Client/views/' + Modules.config.homepage);
    res.sendFile(filePath);
});

app.get('/room/:id', function(req, res) {
    //console.log("user -> " + JSON.stringify(req.user));
    var userName = (req.user !== undefined) ? req.user.username : "user";
	var password = (req.user !== undefined) ? req.user.password : "user";
	  
    /* Get the most suitable index file in dependency to the given gui type. */
	var indexFilename = '';
	if (req.guiType == 'mobilephone') {
        indexFilename = 'mobilephone/index.html';
    } else {
		indexFilename = 'desktop/index.html';
	}
	
	res.render(indexFilename, {start_room: req.params.id, username: userName, password: password});
});

// room list for coupling navigation
app.get('/getRooms', function(req, res) {
	Modules.RoomController.listRooms(function(err, rooms) {
		
		if (err) {
			console.log("Error during listRooms");
		} else {
			res.set('Content-Type', "application/json");
		    res.status(200).send(JSON.stringify(rooms));
		}
	});
});

app.get('/objectIcons/:objectType/:section?', function(req, res) {
    var obj = Modules.ObjectManager.getPrototype(req.params.objectType);

    if (!obj) {
	    return res.send(404, 'Object not found ' + req.params.objectType);
    }

	res.sendFile(path.resolve(__dirname, obj.localIconPath(req.params.section)));
});

app.get('/categoryIcons/:category', function(req, res) {
	var iconPath = path.resolve(__dirname, '../objects/' + req.params.category + '/icon.png');
	
	if (!fs.existsSync(iconPath)) {
		res.send(404, 'Object not found ' + req.params.category);
	}
	
	res.sendFile(iconPath);
});

app.post('/setContent/:roomID/:objectID/:hash', function(req, res) {
	var roomID = req.params.roomID;
	var objectID = req.params.objectID;
	
	var object = Modules.ObjectManager.getObject(roomID, objectID, req.context);
	var historyEntry = {
	    'objectID': roomID,
	    'roomID': roomID,
	    'action': 'setContent'
	};

	Modules.ObjectManager.history.add(new Date().toDateString(), req.context.user.username, historyEntry);
	
	if (!object) {
		Modules.Log.warn('Object not found (roomID: ' + roomID + ' objectID: ' + objectID + ')');
		return res.send(404, 'Object not found');
    }
	
	var formidable = require('formidable');
	var form = new formidable.IncomingForm();

	form.parse(req, function (err, fields, files) {
		
		object.copyContentFromFile(files.file.path, function() {
			object.set('hasContent', true);
			object.set('contentAge', new Date().getTime());
			object.set('mimeType', files.file.type);
					
			/* check if content is inline displayable */
			if (Modules.Connector.isInlineDisplayable(files.file.type)) {
				object.set('preview', true);
				object.persist();

				/* get dimensions */
				Modules.Connector.getInlinePreviewDimensions(roomID, objectID, files.file.type, true, function (width, height) {
					if (width != false)  object.setAttribute("width", width);
					if (height != false) object.setAttribute("height", height);

					//send object update to all listeners
					object.persist();
					object.updateClients('contentUpdate');

					res.sendStatus(200);
				});
			} else {
				object.set('preview', false);

				//send object update to all listeners
				object.persist();
				object.updateClients('contentUpdate');

				res.sendStatus(200);
			}
			
			/* Restrict the uploaded file size, the maximum file size is spezified in the config */
			var filesize = files.file.size; 
			
			if (Modules.Config.maxFilesizeInMB * 1000000 < filesize) {
				fs.unlinkSync(files.file.path);
				
				//delete the object after waiting for a couple of time to avoid deleting an unfinished object
				setTimeout(function() { Modules.ObjectManager.remove(object) }, 3000);		
			}	
						
		});		
		
		// convert pdf to html if neccessary
	    if (files.file.type == 'application/pdf') {
	      Modules.EventBus.emit('pdfAdded', {object: object, file: files.file});
	    }
		
	});  // form
});

app.get('/paintings/:roomID/:user/:picID/:hash', function(req, res) {
	var roomID = req.params.roomID;
	var user   = req.params.user;
	
	if (Modules.Connector.getPaintingStream !== undefined) {
		var objStream = Modules.Connector.getPaintingStream(roomID, user, req.context);
		
		if (objStream == undefined) {
			res.send(404, 'Image not found ');
		} else {
			objStream.pipe(res);
			objStream.on("end", function() {
				try {
					
//					res.set({
//						'Content-Type' : 'image/png', 
//						'Content-Disposition': 'attachment',
//						'filename': req.params.user + '.png'
//					});umstreiten
//			
//		            res.status(200).end();
		        } catch (err) {
		            console.error("paintings ex: " + err);
		        }
			})
		}
	} else {
		res.set('Content-Type', 'text/plain');
	    res.send(200, 'Connector does not support PaintingStreams');
	}
});

// p3 might specify a content age
app.get('/getContent/:roomID/:objectID/:p3/:hash', function(req, res) {
	var roomID   = req.params.roomID;
	var objectID = req.params.objectID;
	
	var object = Modules.ObjectManager.getObject(roomID, objectID, req.context);
	
	if (!object) {
		Modules.Log.warn('Object not found (roomID: ' + roomID + ' objectID: ' + objectID + ')');
		return res.send(404, "Object not found");
	}
	
	var mimeType = object.getAttribute('mimeType') || 'text/plain';
	
	res.set({
		'Content-Type' : mimeType, 
		'charset': 'ISO-8859-1',
		'Content-Disposition': 'inline',
		'filename': object.getAttribute("name")
	});
	
	if (Modules.Connector.getContentStream !== undefined) {
		var objStream = Modules.Connector.getContentStream(roomID, objectID, req.context);
		objStream.pipe(res, { end: false });
		objStream.on("end", function() {
			try {
				res.status(200).end();
			} catch (ex) {
		        console.error("getContent ex: " + ex);
		    }
		})
	} else {
		var data = object.getContent();
		res.send(200, new Buffer(data));
	}
});

app.get('/getPreviewContent/:roomID/:objectID/:p3/:hash', function(req, res) {
	var roomID   = req.params.roomID;
	var objectID = req.params.objectID;
	
	var object = Modules.ObjectManager.getObject(roomID, objectID, req.context);
	
	 if (!object) {
		 return  res.send(404, 'Object not found');
	 }
	
	 object.getInlinePreviewMimeType(function (mimeType) {
			object.getInlinePreview(mimeType, function (data) {

				if (!data) {
					Modules.Log.warn('no inline preview found (roomID: ' + roomID + ' objectID: ' + objectID + ')');

					if (mimeType.indexOf("image/") >= 0) {
						fs.readFile(__dirname + '/../Client/guis.common/images/imageNotFound.png', function (err, data) {

							if (err) {
								Modules.Log.warn("Error loading imageNotFound.png file (" + req.path + ")");
					            return res.send(404, '404 Error loading imageNotFound.png file');
							}

							res.set({'Content-Type': 'image/png', 'Content-Disposition': 'inline'});
				            res.status(200).send(data);
						});
					} else {
						res.status(404).send('Object not found');
					}

				} else {
					res.set({'Content-Type': 'text/plain', 'Content-Disposition': 'inline'});
			        res.status(200).send(new Buffer(data));
				}
			});
	 });
});

// Combine all javascript files in guis.common/javascript
app.get('/defaultJavascripts', function(req, res) {
    Q.nfcall(fs.readdir, 'Client/guis.common/javascript').then(function(files) {
        files.sort(function(a, b) {
        	return parseInt(a) - parseInt(b);
        });
        
        var fileReg = /[0-9]+\.[a-zA-Z]+\.js/;

        files = _.filter(files, function(fname) {
        	return fileReg.test(fname);
        });

        var etag = "";

        files.forEach(function(file) {
        	var stats = fs.statSync('Client/guis.common/javascript/' + file);
        	etag += stats.size + '-' + Date.parse(stats.mtime);
        });

        if (req.get('if-none-match') === etag) {
        	res.sendStatus(304);
        } else {
        	var readFileQ = Q.denodeify(fs.readFile);
        	var promises = files.map(function(filename) {
        		return readFileQ('Client/guis.common/javascript/' + filename);
        	});

        	var combinedJS = "";

        	// Go on if all files are loaded
        	Q.allSettled(promises).then(function(results) {
        		results.forEach(function(result) {
        			combinedJS += result.value + "\n";
        		});

        		var mimeType = 'application/javascript';
        		res.set({'Content-Type': mimeType, 'ETag': etag});
        		res.status(200).send(combinedJS);
        	});
        }
    });
});

app.get('/time', function(req, res) {
	var currentdate = new Date(); 
	var etag = currentdate.getTime();
	 if (req.get('if-none-match') === etag) {
     	res.sendStatus(304);
     } else {
		var datetime = "Time: " + currentdate.getDate() + "/"
		                + (currentdate.getMonth()+1)  + "/" 
		                + currentdate.getFullYear() + " @ "  
		                + currentdate.getHours() + ":"  
		                + currentdate.getMinutes() + ":" 
		                + currentdate.getSeconds();
		res.writeHead(200, {'ETag': etag});
		res.end(datetime);
		
		res.set({'ETag': etag});
        res.send(200, datetime);
	}
});

app.get('/config.js', function(req, res) {
	var obj = JSON.stringify(Modules.ConfigClient);
	var data = "\"use strict\";" + "\n" + "\n" + "var Config=" + obj + ';';	
	
	res.status(200).send(data); 
});

app.get('/objects', function(req, res) {
	var code = Modules.BuildTool.getClientCode(req.guiType);

	res.set('Content-Type', 'application/javascript');
	res.status(200).send(code);
});

module.exports = WebServer;