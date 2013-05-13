/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Scale=Object.create(Modules.ObjectManager.getPrototype('Arrow'));

Scale.register=function(type){
	
	// Registering the object
	
	Arrow=Modules.ObjectManager.getPrototype('Arrow');
	Arrow.register.call(this,type);
	
	
	this.attributeManager.registerAttribute('min',{type:'number',standard:0,min:0,category:'Values'});
	this.attributeManager.registerAttribute('max',{type:'number',standard:10,min:0,category:'Values'});
	this.attributeManager.registerAttribute('stepping',{type:'number',standard:1,min:1,category:'Values'});
	
}

Scale.register('Scale');
Scale.isCreatable=true;

module.exports=Scale;