/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	console.log('onLeave' +object);
};

theObject.onEnter=function(object,oldData,newData){
	console.log('onEnter' +object);
	updateLog(object);
};

theObject.onMoveWithin=function(object,oldData,newData){
	
};

theObject.onMoveOutside=function(object,oldData,newData){
	
};

function updateLog(object){
	console.log('updateLog '+object);
	
    var inventory=object.getRoom().getInventory();
    
    var loggingObject=false;
    
    for (var i in inventory){
    	var candidate=inventory[i];
    	if (candidate.getAttribute('name')=='logger') loggingObject=candidate;
    }
	
	var insertText=function(logger,object){
		console.log('insertText '+logger+' '+object);
		var text=logger.getContentAsString();
		var newLine=object.getAttribute('name')+' just entered';
		text=newLine+String.fromCharCode(10)+text;
		logger.setContent(text);
	}
	
	if (loggingObject){
		insertText(loggingObject,object);
	} else {
		console.log('Creating logger');
		object.getRoom().createObject('Textarea',function(err,obj){
			obj.setAttribute('name','logger');
			insertText(obj,object);
		});
	}
}