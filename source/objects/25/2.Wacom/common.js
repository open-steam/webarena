/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Wacom=Object.create(Modules.ObjectManager.getPrototype('VGA'));

Wacom.register=function(type){
	
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('VGA');
	IconObject.register.call(this,type);
}

Wacom.execute=function(){
}

Wacom.isCreatable=true;
Wacom.moveByTransform = function(){return true;};

module.exports=Wacom;