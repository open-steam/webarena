/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2015
*
*/

var Modules=require('../../../server.js');

var BlackHole=Object.create(Modules.ObjectManager.getPrototype('Hotspot'));

BlackHole.register=function(type){
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('Hotspot');
	GeneralObject.register.call(this,type);
}

BlackHole.execute=function(){
	alert('Und nun?');
}



BlackHole.isCreatable=true;
BlackHole.onMobile = false;

module.exports=BlackHole;