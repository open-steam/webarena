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
	"reset" : '\u001b[0m'
}

Log.classNameLength = 16;
Log.functionNameLength = 20;

Log.init=function(theModules){
	Modules=theModules;
}

Log.getTime=function() {
	var date = new Date();
	return date.toLocaleString();
}

Log.formatString=function(str,len) {
	if (str.length >= len) return str.slice(0,len);
	for (var i = str.length; i < len; i++) {
		str = str+" ";
	}
	return str;
}

Log.formatClassName=function(str) {
	return Log.formatString(str, Log.classNameLength);
}

Log.formatFunctionName=function(str) {
	return Log.formatString(str, Log.functionNameLength);
}


Log.getLogString=function(className,functionName,message,color) {
	return color+""+Log.getTime()+"   "+Log.formatClassName(className)+"   "+Log.formatFunctionName(functionName)+"   "+message+""+Log.colors.reset;
}

Log.info=function(className, functionName, message) {
	console.log(Log.getLogString(className,functionName,message,Log.colors.info));
}

Log.error=function(className, functionName, message) {
	console.error(Log.getLogString(className,functionName,message,Log.colors.error));
	throw new Error();
}

Log.warn=function(className, functionName, message) {
	console.log(Log.getLogString(className,functionName,message,Log.colors.warn));
}

Log.debug=function(className, functionName, message) {
	console.log(Log.getLogString(className,functionName,message,Log.colors.debug));
}

Log.getUserFromContext=function(context) {
	return Modules.CacheManager.getCacheUser(context);
}


module.exports=Log;