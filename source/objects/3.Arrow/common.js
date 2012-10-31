/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Arrow=Object.create(Modules.ObjectManager.getPrototype('Line'));

Arrow.register=function(type){
	
	// Registering the object
	
	Line=Modules.ObjectManager.getPrototype('Line');
	Line.register.call(this,type);
	
	
	this.attributeManager.registerAttribute('markerStart',{type:'boolean',standard:false,category:'Appearance'});
	this.attributeManager.registerAttribute('markerEnd',{type:'boolean',standard:true,category:'Appearance'});

	this.attributeManager.registerAttribute('linesize',{type:'number',min:4,standard:4,category:'Appearance'});
	
}

Arrow.register('Arrow');
Arrow.isCreatable=true;

module.exports=Arrow;