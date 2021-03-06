/**
 * Provides mechanisms to create the client code.
 */

"use strict";

var fs = require('fs');

var  BuildTool = {}
var enter = String.fromCharCode(10);
var Modules = false;
var showDebugLineNumbers;

/**
 *  addToClientCode (internal)
 **/
BuildTool.clientCode = '"use strict";' + enter + '//Object Code for WebArena Client ' + enter;

BuildTool.addToClientCode = function(filename) {
	var fileContent = false;
	try {
		fileContent = fs.readFileSync(filename, 'UTF8');

		//Add linenumbers as in file
		if(showDebugLineNumbers){
			fileContent = fileContent.split(enter).reduce(function(soFar, line, index){
				return soFar + line + " //" + (index +1) + enter;
			}, "");
		}
		BuildTool.clientCode += enter + enter + '//' + filename + enter + enter + fileContent;
		return true;
	} catch (e) {
		BuildTool.clientCode += enter + enter + '//' + filename + enter + enter + ' //' + e;
		return false;
	}
}

BuildTool.buildClientCode = function(){
	var that = this;
	var files = Modules.ObjectManager.getEnabledObjectTypes();
	this.clientCode = '"use strict";' + enter + '//Object Code for WebArena Client ' + enter;          
    this.clientCode += enter + "window.onerror = function(message, uri, line){var data={};\n\
    data.message=message;data.uri=uri;data.line=line;data.nav = navigator.userAgent;\n\
	data.roomID=ObjectManager.getRoomID();data.user = ObjectManager.getUser().username;\n\
	ObjectManager.clientErrorMessage(data,function(){});}";

	files.forEach(function (data) {
		
		var filename=data.filename;
		var category=data.category;
		
		var fileinfo = filename.split('.');
		var index = fileinfo[0];
		var objName = fileinfo[1];
		if (!index) return;
		if (!objName) return;
		
		if (objName=='File') {
			var temp='WAFile'; //This is a hot fix to avoid overwriting the browser side File object
		} else temp=objName;

		var filebase = __dirname + '/../objects/' + category + '/' + filename;
		
		if (that.addToClientCode(filebase + '/common.js')){
		
			that.addToClientCode(filebase + '/client.js');
			that.addToClientCode(filebase + '/view.js')
		
			that.clientCode += enter + temp + '.register("' + objName + '");' + enter + enter;
			that.clientCode += enter + temp + '.clientRegister();' + enter + enter;
			that.clientCode += enter + temp + '.category="' + category +'";' + enter + enter;
			
			that.addToClientCode(filebase + '/languages.js');
			
		 } else {	
			that.clientCode += enter + 'console.log("Cannot register '+temp+'");';
		 }

	});
}

/**
 *  getClientCode
 *
 *  get the combined client side sourcecode for objects.
 **/
BuildTool.getClientCode = function () {
	this.buildClientCode();
	return this.clientCode;
}

BuildTool.init = function(theModules){
	Modules = theModules;
	showDebugLineNumbers = !!Modules.config.debugMode;
	// this.buildClientCode();
}

module.exports = BuildTool;