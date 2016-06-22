/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */


var printLogo = function() {
	var localconfig = require('./config.local.js');
	var imprint = localconfig.about;
	var printList = function(aData){
		var list="";
		for (i = 0; i < aData.length; i++) { 
			logo.push("#  "+aData[i]);
		}
		return list;
	};
	var printObject = function(aData){
		var list="";
		for (var prop in aData) {
		  logo.push("#  "+aData[prop]);
		}
		return list;
	};
    var logo = [
		'##############################################################',
		'#             '+imprint.project+'                  #'];
	    logo.push("##############################################################");
	    logo.push("#");
	    logo.push('# '+imprint.copyright);
		logo.push("#");
		printObject(imprint.adress);
		logo.push("#");
		logo.push("# Main contributors");
	 	printList(imprint.contributors);
		logo.push("#");
		logo.push("# Contact");
		printObject(imprint.contact);
		logo.push("#");
		logo.push("# Guarantor");
		printObject(imprint.guarantor);
		logo.push("##############################################################");
    logo.forEach(function(l) {
        console.log(l);
    });
}();

"use strict";

//Loading the configuration. Entires in config.local.js overlap those in config.default.js
var config = require('./config.default.js');

try {
    var localconfig = require('./config.local.js');
    for (var key in localconfig) { //overwrite Client data
        if (key != "server") {
            var value = localconfig[key];
            config[key] = value;
        }
    }
    for (var key in localconfig.server) { //overwrite Server data
        var value = localconfig.server[key];
        config.server[key] = value;
    }
} catch (e) {
    console.log(e);
    console.log('Attention: No local config found or the file could not be read.');
    console.log('Solution: Copy the content of the config.default and create a new config.local in the same directory! Don\'t forget to update the filebase property to your desired folder!');
}


//store the general config/client config in an own variable
var clientConfig = {};
for (var prop in config) {
    if (prop != "server") {
        clientConfig[prop] = config[prop];
    }
}

//mix the exclusive server config with the General/Client config
for (var key in config.server) {
    var value = config.server[key];
    config[key] = value;
}
delete config.server;

var winston = require('winston');
var logger = new (winston.Logger)({
    exitOnError: false,
    transports: [
        new (winston.transports.Console)({colorize: true, json: true, handleExceptions: true}),
        new (winston.transports.File)({filename:"error/error.log" , colorize: true, json: true , handleExceptions:true, maxsize:1048576})
        
    ]
});


var Modules = {};

Modules.Server = {};

Modules.Log = require('./Common/Log.js');

Modules.Logger = logger;

// These modules are accessible everywhere by accessing the global variable Modules
// They shall exist only once for the whole server

Modules.config = config;
Modules.Config = config;
Modules.ConfigClient = clientConfig;

Modules.ObjectManager = require('./Server/ObjectManager.js');
Modules.WebServer = require('./Server/WebServer.js');
Modules.SocketServer = require('./Server/SocketServer.js');
Modules.UserManager = require('./Server/UserManager.js');
Modules.Helper = require('./Server/Helper.js');
Modules.BuildTool = require('./Server/BuildTool.js');
Modules.ApplicationManager = require('./Server/ApplicationManager.js');
Modules.Applications = Modules.ApplicationManager;

// These object exist for every object type or every single object. They shall not be
// modified directly but inherited (e.g. this.attributeManager=Object.create(AttributeManager));
Modules.DataSet = require('./Common/DataSet.js');
Modules.AttributeManager = require('./Server/AttributeManager.js');

Modules.Connector = Modules.config.connector; //shortcut

//Controllers
Modules.RoomController = require('./Server/controllers/RoomController.js');
Modules.ObjectController = require('./Server/controllers/ObjectController.js');
Modules.ServerController = require('./Server/controllers/ServerController.js');

Modules.Dispatcher = require('./Server/Dispatcher.js');

// Objects can gain access to the Modules (on the server side) by requiring this file
module.exports = Modules;

// Initialize all Modules if there is a init-function
for (var name in Modules) {
    var module = Modules[name];
    if (module.init) {
        module.init(Modules);
    }
}

Modules.Server.shutDown=function(context){
	Modules.UserManager.isGod(context,function(){
		shutDown(8);
	});
}

function shutDown(counter){
	if (counter<=0) process.exit();
	Modules.ObjectManager.shout('The server is shutting down in '+(counter*5)+' seconds.');
	setTimeout(function(){
		shutDown(counter-1);
	},5000)
}
