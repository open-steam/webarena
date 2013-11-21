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
	var files = fs.readdirSync(__dirname + '/../objects');
	var that = this;

	files.sort(function (a, b) {
		return parseInt(a) - parseInt(b);
	});

	var whiteList = {};
	var blackList = {};
	var hasWhiteList = false;

	for (var i in Modules.config.objectWhitelist) {
		hasWhiteList = true;
		whiteList[Modules.config.objectWhitelist[i]] = true;
	}

	for (var i in Modules.config.objectBlacklist) {
		blackList[Modules.config.objectBlacklist[i]] = true;
	}

	if (hasWhiteList) {
		whiteList.GeneralObject = true;
		whiteList.Room = true;
		whiteList.IconObject = true;
		whiteList.UnknownObject = true;
		whiteList.ImageObject = true;
	}

	files.forEach(function (filename) {
		var fileinfo = filename.split('.');
		var index = fileinfo[0];
		var objName = fileinfo[1];
		if (!index) return;
		if (!objName) return;

		if (hasWhiteList && !whiteList[objName]) {
			console.log('Type ' + objName + ' not whitelisted.');
			return;
		}

		if (blackList[objName]) {
			console.log('Type ' + objName + ' is blacklisted.');
			return;
		}

		var filebase = __dirname + '/../objects/' + filename;
		that.addToClientCode(filebase + '/common.js');
		that.addToClientCode(filebase + '/client.js');
		that.addToClientCode(filebase + '/view.js');
		that.clientCode += enter + objName + '.register("' + objName + '");' + enter + enter;
		that.addToClientCode(filebase + '/languages.js');

	});
}

/**
 *  getClientCode
 *
 *  get the combined client side sourcecode for objects.
 **/
BuildTool.getClientCode = function () {
	return this.clientCode;
}

BuildTool.init = function(theModules){
	Modules = theModules;
	showDebugLineNumbers = !!Modules.config.showDebugLineNumbers;
	this.buildClientCode();
}

module.exports = BuildTool;