/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


"use strict";


var Log={};
var Modules = false;

Log.colors = {
	"info" 	: '\u001b[0m',
	"error" : '\u001b[31m',
	"warn" 	: '\u001b[33m',
	"debug" : '\u001b[34m',
	"reset" : '\u001b[0m',
}

Log.linebreak = '\n';


Log.init=function(theModules){
	Modules=theModules;
}

Log.getTime=function() {
	var date = new Date();
	return date.toLocaleString();
}

Log.getLogString=function(message,color) {
	return color+""+Log.getTime()+"   "+message+""+Log.colors.reset+"\n";
}

Log.info=function(message) {
	if (!Modules.Config.logLevels.info) return;
	
	var lines = new Error().stack.match(/^.*((\r\n|\n|\r)|$)/gm);
	
	var on = "\n"+lines[2].replace(/\n/g, '');
	
	console.log(Log.getLogString(message+on,Log.colors.info));
	
}

Log.error=function(message) {

	if (message.stack === undefined) {
		//Log.error was directly called --> create real error (to get stack)
		throw new Error(message);
	}

	var msg = message.stack;
	
	//var lines = msg.match(/^.*((\r\n|\n|\r)|$)/gm);
	//lines.splice(1,1);
	//msg = lines.join("");

	console.error(Log.getLogString(msg,Log.colors.error));

}

Log.warn=function(message) {
	if (!Modules.Config.logLevels.warn) return;
	
	var lines = new Error().stack.match(/^.*((\r\n|\n|\r)|$)/gm);
	
	var on = "\n"+lines[2].replace(/\n/g, '');
	
	console.log(Log.getLogString(message+on,Log.colors.warn));
	
}

Log.debug=function(message) {
	if (!Modules.Config.logLevels.debug) return;
	
	var lines = new Error().stack.match(/^.*((\r\n|\n|\r)|$)/gm);
	
	var on = "\n"+lines[2].replace(/\n/g, '');
	
	console.log(Log.getLogString(message+on,Log.colors.debug));
	
}

Log.getUserFromContext=function(context) {
	if (context === true) {
 		return "root";
	} else {
		return context.user.username;
	}
}


module.exports=Log;