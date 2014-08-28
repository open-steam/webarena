/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Indicator=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Indicator.register=function(type){
	
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
}

Indicator.execute=function(openInNewWindow){
}

Indicator.isCreatable=true;
Indicator.moveByTransform = function(){return true;};

module.exports=Indicator;