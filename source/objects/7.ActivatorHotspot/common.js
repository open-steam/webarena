/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js')
var ActivatorHotspot=Object.create(Modules.ObjectManager.getPrototype('ActiveObject'));

ActivatorHotspot.register=function(type){
	
	// Registering the object
	ActiveObject=Modules.ObjectManager.getPrototype('ActiveObject');
	ActiveObject.register.call(this,type);
	

	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

ActivatorHotspot.register('ActivatorHotspot');
ActivatorHotspot.isCreatable=true; 

module.exports=ActivatorHotspot;