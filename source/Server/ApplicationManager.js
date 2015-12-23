/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2015
 *
 */


"use strict";

var fs = require('fs');
var async = require("async");
var ApplicationManager = {};

var Modules = false;

ApplicationManager.toString = function() {
    return 'Application Manager';
}


/**
 *  init
 *
 *  initializes the ObjectManager
 **/
ApplicationManager.init = function(theModules) {
	if (this.initialized) return;
    var that = this;
    Modules = theModules;
	this.initialized=true;
}


ApplicationManager.message=function(identifier,object,data){
	console.log('ApplicationManager.message: '+identifier+': '+object,data);
}

module.exports = ApplicationManager;