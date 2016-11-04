/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Upperroom=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Upperroom.register=function(type){
	
	// Registering the object
	
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	var self=this;
	

	
}

Upperroom.register('Upperroom');
Upperroom.isCreatable=true;

module.exports=Upperroom;