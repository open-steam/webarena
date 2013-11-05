/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var printLogo = function(){
   var logo = ['##########################################',
	'#    W E B A R E N A   S E R V E R       #',
	'#                                        #',
	'#    (c) 2012-13 Contextual Informatics, #',
	'#                Universität Paderborn   #',
	'#                                        #',
	'#    Main contributors:                  #',
	'#                                        #',
	'#        Felix Winkelnkemper             #',
	'#        Tobias Kempkensteffen           #',
	'#        Viktor Koop                     #',
	'#                                        #',
	'##########################################'];

	logo.forEach(function(l){
		console.log(l);
	});
}();

"use strict";

//General error handling. Let the server try to continue
//if an error occured and log the error

process.on('uncaughtException', function (err) {
	Modules.Log.error(err);
});

//Loading the configuration. Entires in config.local.js overlap those in config.default.js

var config=require('./Server/config.default.js');
global.config = config;  // make config available for modules
try {
	var localconfig=require('./Server/config.local.js');
	for (var key in localconfig){
		var value=localconfig[key];
		config[key]=value;
	}
} catch (e) {
	console.log('Attention: No local config');
}

//Load server modules
var  Modules={
	
	Log:require('./Common/Log.js'),
	
	// These modules are accessible everywhere by accessing the global variable Modules
	// They shall exist only once for the whole server
	
	'config':config,
	'Config':config,
	ObjectManager:require('./Server/ObjectManager.js'),
	Dispatcher:require('./Server/Dispatcher.js'),
	WebServer:require('./Server/WebServer.js'),
	SocketServer:require('./Server/SocketServer.js'),
	UserManager:require('./Server/UserManager.js'),
	Helper:require('./Server/Helper.js'),

	EventBus :  require("./Server/Eventbus.js"),
	TokenChecker: require("./Server/TokenChecker"),
	// These object exist for every object type or every single object. They shall not be
	// modified directly but inherited (e.g. this.attributeManager=Object.create(AttributeManager));
	
	DataSet:require('./Common/DataSet.js'),
	AttributeManager:require('./Common/AttributeManager.js'),
	TranslationManager:require('./Common/TranslationManager.js'),
	ActionManager:require('./Common/ActionManager.js'),
	
};

if(Modules.config.tcpApiServer){
	Modules['TcpEventServer'] = 	require("./Server/TCPSocketServer.js").create();
}

Modules.Connector=Modules.config.connector; //shortcut

// Objects can gain access to the Modules (on the server side) by requireing this file
module.exports=Modules;

// Initialize all Modules if there is a init-function
for (var name in Modules){
	var module=Modules[name];
	if (module.init) {
		module.init(Modules);
	}
}

//create temp. directory
var fs = require('fs');
if (!fs.existsSync("./Server/tmp")) {
	fs.mkdirSync("./Server/tmp", 0777);
}
