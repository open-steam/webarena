/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js')
var Hotspot=Object.create(Modules.ObjectManager.getPrototype('EvaluationObject'));

Hotspot.register=function(type){
	
	// Registering the object
	EvaluationObject=Modules.ObjectManager.getPrototype('EvaluationObject');
	EvaluationObject.register.call(this,type);
	

	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

Hotspot.register('Hotspot');
Hotspot.isCreatable=true; 

module.exports=Hotspot;