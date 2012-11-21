/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var MereologyElement=Object.create(Modules.ObjectManager.getPrototype('ActiveObject'));
//TODO this must be a semanticObject

MereologyElement.register=function(type){
	
	// Registering the object
	ActiveObject=Modules.ObjectManager.getPrototype('ActiveObject');
	ActiveObject.register.call(this,type);
	

	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

MereologyElement.register('MereologyElement');
MereologyElement.isCreatable=true; 

module.exports=MereologyElement;