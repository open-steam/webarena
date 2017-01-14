/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

"use strict";

var Application={};
var Modules = require('../../server.js');

Application.toString=function(){
	return 'Application '+this.name;
}
	
Application.init=function(name,theModules){
	this.name=name;
	Modules=theModules;
}

Application.message=function(identifier, object, data, callback){
	//console.log(this+' got message '+identifier);

	if (this[identifier]) this[identifier](object,data, callback);
}

Application.event=function(identifier,object,data){
	//console.log(this+' got event '+identifier);
	
	var fnName='on'+ucfirst(identifier);
	
	if (this[fnName]) this[fnName](object,data);
}

function ucfirst(str) {
  //  discuss at: http://phpjs.org/functions/ucfirst/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // improved by: Brett Zamir (http://brett-zamir.me)
  //   example 1: ucfirst('kevin van zonneveld');
  //   returns 1: 'Kevin van zonneveld'

  str += '';
  var f = str.charAt(0)
    .toUpperCase();
  return f + str.substr(1);
}

/**
 * saveApplicationData allows an application to write persistent key-value-data for later use
 * (See Roomstate for an example of what you can do)
 *
 * @param  {String} appID The ID of the app
 * @param  {String} key   The key 
 * @param  {Object} value The value that is supposed to be stored
 *
 */
Application.saveApplicationData = function(appID, key, value){
	Modules.Connector.saveApplicationData(appID, key, value);
}


/**
 * Reads the persistent application data and returns
 *
 * @param  {String}   appID    The ID of the app
 * @param  {String}   key      The key of the data
 * @param  {Function} callback The callback function
 */
Application.getApplicationData = function(appID, key, callback){
	Modules.Connector.getApplicationData(appID, key, callback);
}


module.exports=Application;