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
	} catch (e) {
		BuildTool.clientCode += enter + enter + '//' + filename + enter + enter + ' //' + e;
	}
}

BuildTool.buildClientCode = function(){
	var that = this;
	var files = Modules.ObjectManager.getEnabledObjectTypes();
	this.clientCode = '"use strict";' + enter + '//Object Code for WebArena Client ' + enter;
                //TODO: Insert code for the server sided transmission of client errors
        this.clientCode += enter + "window.onerror = function(message, uri, line){var data={};\n\
    data.message=message;data.uri=uri;data.line=line;\n\
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
			var temp='WAFile'; //TODO This is a hot fix. Implement proper namespaces instead
		} else temp=objName;

		var filebase = __dirname + '/../objects/' + category + '/' + filename;
		that.addToClientCode(filebase + '/common.js');
		that.addToClientCode(filebase + '/client.js');
		
		/* Objects which has a mobile representation must have a file named mobileView.js. */
		if (Modules.WebServer.guiType == "desktop") {
			that.addToClientCode(filebase + '/view.js');
		} else {
			that.addToClientCode(filebase + '/mobileView.js');
		}
		
		that.clientCode += enter + temp + '.register("' + objName + '");' + enter + enter;
		that.clientCode += enter + temp + '.category="' + category +'";' + enter + enter;

		that.addToClientCode(filebase + '/languages.js');

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