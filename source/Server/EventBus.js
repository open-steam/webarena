"use strict";

var EventEmmiter2 = require('eventemitter2').EventEmitter2;
var Modules = false;

var myEmmiter = new EventEmmiter2({
	wildcard: true,
	delimiter: '::'

});

myEmmiter.init = function(theModules){
	Modules = theModules;
}

module.exports = myEmmiter;