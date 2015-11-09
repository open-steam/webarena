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
	
	
	this.registerAttribute('destination', {type: 'Hyperlink', standard: "choose", linkFunction: function(object) {
           object.showExitDialog()
       }, category: 'Hyperlink', changedFunction: function(object) {
           if(object.updateIcon){object.updateIcon()};
    }});
}

BlackHole.execute=function(){
	
}



BlackHole.isCreatable=true;

module.exports=BlackHole;