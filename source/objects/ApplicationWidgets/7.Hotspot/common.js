/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var Hotspot=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Hotspot.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeSensitive();
	
	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

Hotspot.isCreatable=false; 

module.exports=Hotspot;