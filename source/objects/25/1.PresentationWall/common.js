/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var PresentationWall=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

PresentationWall.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
}

PresentationWall.onDrop=function(where){

	var logger=ObjectManager.getObjectByName('logger');
	
	if (!logger) return;
	
	var enter = String.fromCharCode(10);
	
	logger.getContentAsString(function(text){
		where.deselect();
		text=where+enter+text;
		logger.setContent(text);
	});

	
}

PresentationWall.isCreatable=true; 

module.exports=PresentationWall;