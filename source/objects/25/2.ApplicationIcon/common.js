/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var ApplicationIcon=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

ApplicationIcon.register=function(type){
	
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
}

ApplicationIcon.execute=function(){
}

ApplicationIcon.isCreatable=true;
ApplicationIcon.moveByTransform = function(){return true;};

module.exports=ApplicationIcon;