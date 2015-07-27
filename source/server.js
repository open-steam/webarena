/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */


var printLogo = function() {
    var logo = ['##########################################',
        '#    W E B A R E N A   S E R V E R       #',
        '#                                        #',
        '#    (c) 2012-15 Contextual Informatics, #',
        '#                Universität Paderborn   #',
        '#                                        #',
        '#    Main contributors:                  #',
        '#                                        #',
        '#        Felix Winkelnkemper             #',
        '#        Tobias Kempkensteffen           #',
        '#        Viktor Koop                     #',
        '#        Jan Petertonkoker               #',
        '#        Steven Christopher Lücker       #',
        '#        Christoph Sens                  #',
        '#                                        #',
        '##########################################'];

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
    console.log('Attention: No local config found!');
    console.log('Solution: Copy the content of the config.default and create a new config.local in the same directory! Don\'t forget to update the filebase property to your desired folder!');
    console.log('The old config.local files which are located IN the Client or Server folder can be removed.');
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

//General error handling. Let the server try to continue
//if an error occured and log the error
/*if (!config.debugMode){
 process.on('uncaughtException', function (err) {
 console.log('##### UNCAUGHT EXCEPTION');
 console.log(err.stack);
 });
 } */

var winston = require('winston');
var logger = new (winston.Logger)({
    exitOnError: false,
    transports: [
        new (winston.transports.Console)({colorize: true, json: true, handleExceptions: true}),
        new (winston.transports.File)({filename:"error/error.log" , colorize: true, json: true , handleExceptions:true, maxsize:1048576})
        
    ]
});


var Modules = {};

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
Modules.EventBus = require("./Server/EventBus.js");
/*Modules.TokenChecker = require("./Server/TokenChecker");*/
Modules.BuildTool = require('./Server/BuildTool.js');
Modules.FTPConnection = require('./Server/FTPConnection.js');
Modules.KoalaConnection = require('./Server/KoalaConnection.js');

// These object exist for every object type or every single object. They shall not be
// modified directly but inherited (e.g. this.attributeManager=Object.create(AttributeManager));
Modules.DataSet = require('./Common/DataSet.js');
Modules.AttributeManager = require('./Common/AttributeManager.js');
Modules.TranslationManager = require('./Common/TranslationManager.js');
Modules.ActionManager = require('./Common/ActionManager.js');


if (Modules.config.tcpApiServer) {
    Modules['TcpEventServer'] = require("./Server/TcpSocketServer.js").create();
}

Modules.Connector = Modules.config.connector; //shortcut

//Controllers
Modules.RoomController = require('./Server/controllers/RoomController.js');
Modules.ObjectController = require('./Server/controllers/ObjectController.js');
Modules.ServerController = require('./Server/controllers/ServerController.js');

Modules.InternalDispatcher = require('./Server/apihandler/InternalDispatcher.js');
Modules.Dispatcher = require('./Server/apihandler/Dispatcher.js');

// Objects can gain access to the Modules (on the server side) by requireing this file
module.exports = Modules;

// Initialize all Modules if there is a init-function
for (var name in Modules) {
    var module = Modules[name];
    if (module.init) {
        module.init(Modules);
    }
}



//load plugins
if (Modules.config.plugins) {
    Modules.PluginManager = require('./Server/PluginManager.js').create();
    Modules.PluginManager.init(Modules, Modules.config.plugins);
}
