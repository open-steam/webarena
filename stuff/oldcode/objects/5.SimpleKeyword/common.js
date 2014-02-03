/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var SimpleKeyword=Object.create(Modules.ObjectManager.getPrototype('SimpleText'));

SimpleKeyword.category='Actor';

SimpleKeyword.register=function(type){
	
	// Registering the object
	
	SimpleText=Modules.ObjectManager.getPrototype('SimpleText');
	SimpleText.register.call(this,type);

	
	this.registerAttribute('key',{type:'text',standard:'key',category:'Keyword'});
	this.registerAttribute('value',{type:'text',standard:'value',category:'Keyword'});
	this.registerAttribute('text',{type:'text',standard:'Keyword',category:'Keyword'});
	
}

SimpleKeyword.register('SimpleKeyword');

module.exports=SimpleKeyword;