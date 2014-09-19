/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var VolumeControl=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

VolumeControl.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	
	this.registerAttribute('source',{type:'text',standard:'',category:'Elements'});
	this.registerAttribute('value',{type:'number',standard:1,min:0,max:5,category:'Elements'});
}

VolumeControl.onDrop=function(where){

	var logger=ObjectManager.getObjectByName('logger');
	
	if (!logger) return;
	
	var enter = String.fromCharCode(10);
	
	logger.getContentAsString(function(text){
		where.deselect();
		text=where+enter+text;
		logger.setContent(text);
	});

	
}

VolumeControl.isCreatable=true; 

module.exports=VolumeControl;