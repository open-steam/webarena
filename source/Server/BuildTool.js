var fs = require('fs');

var  BuildTool = {}
var enter = String.fromCharCode(10);
var Modules = false;

/**
 *  addToClientCode (internal)
 **/
BuildTool.clientCode = '"use strict";' + enter + '//Object Code for WebArena Client ' + enter;

BuildTool.addToClientCode = function(filename) {
	var file = false;
	try {
		file = fs.readFileSync(filename, 'UTF8');
		BuildTool.clientCode += enter + enter + '//' + filename + enter + enter + file;
	} catch (e) {
		BuildTool.clientCode += enter + enter + '//' + filename + enter + enter + '//' + e;
	}
}

BuildTool.buildClientCode = function(){
	var files = fs.readdirSync('objects');

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

		var obj = require(filebase + '/server.js');

		BuildTool.addToClientCode(filebase + '/common.js');
		BuildTool.addToClientCode(filebase + '/client.js');
		BuildTool.addToClientCode(filebase + '/view.js');
		BuildTool.clientCode += enter + objName + '.register("' + objName + '");' + enter + enter;
		BuildTool.addToClientCode(filebase + '/languages.js');
	});

	//TODO - remove if possible ...only add line numbers if needed
	var lines = this.clientCode.split(enter);
	var showDebugLineNumbers = !!Modules.config.showDebugLineNumbers;
	var code ="";

	//fill in line numbers for debugging
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		code += line

		if (showDebugLineNumbers) code += ' //' + (i + 1)

		code += enter
	}

	this.clientCode = code;
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
	this.buildClientCode();
}

module.exports = BuildTool;