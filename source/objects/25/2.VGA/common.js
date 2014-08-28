/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var VGA=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

VGA.register=function(type){
	
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
}

VGA.execute=function(){
}

VGA.isCreatable=true;
VGA.moveByTransform = function(){return true;};

module.exports=VGA;