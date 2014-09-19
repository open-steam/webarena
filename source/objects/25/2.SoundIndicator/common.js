/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var SoundIndicator=Object.create(Modules.ObjectManager.getPrototype('VGA'));

SoundIndicator.register=function(type){
	
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('VGA');
	IconObject.register.call(this,type);
}

SoundIndicator.execute=function(){
}

SoundIndicator.isCreatable=true;
SoundIndicator.moveByTransform = function(){return true;};

module.exports=SoundIndicator;