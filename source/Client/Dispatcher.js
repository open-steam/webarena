/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

/**
 * @namespace Object holding functions for server communication
 */
var Dispatcher={};

/**
 * List of calls
 */
var calls={};

/**
 * List of waiting response functions
 */
var responseFunctions={};

Dispatcher.call=function(message){
	
	var type=message.name;
	var data=message.data;
	
	if (calls[type]){
	  	calls[type](data);
	} else {
		console.log('ERROR: No function for '+type);
	}
	
}

Dispatcher.response=function(message){
	
	var id=message.id;
	var data=message.data;
	
	if (responseFunctions[id]){	
	  	responseFunctions[id](data);
	  	delete(responseFunctions[id]);
	} else {
		console.log('ERROR: No function for '+id);
	}
}

var responseCleanupTimeout=false;
Dispatcher.counter=1;
Dispatcher.query=function(queryName,queryArguments,responseFunction){
	
	this.counter++;
	var random=this.counter+' '+(new Date().getTime()-1296055327011);
	var responseID=queryName+random;

	responseFunctions[responseID]=responseFunction;
	if (responseCleanupTimeout){
		window.clearTimeout(responseCleanupTimeout);
		responseCleanupTimeout=false;
	}
	responseCleanupTimeout=window.setTimeout(function(){
		responseFunction={}; // get rid of all remaining response functions
	},5000);
	Modules.SocketClient.sendCall(queryName, queryArguments, responseID);
}


Dispatcher.registerCall=function(type,callFunction){
	//callfunction signature (socket,data);
	calls[type]=callFunction;
}


Dispatcher.init=function(){

}