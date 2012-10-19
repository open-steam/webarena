/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var SimpleKeyword=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

SimpleKeyword.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
	this.registerAttribute('font-size',{type:'fontsize',min:10,standard:30,unit:'px',category:'Appearance'});
	this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance'});
	
	this.registerAttribute('key',{type:'text',standard:'key',category:'Keyword'});
	this.registerAttribute('value',{type:'text',standard:'value',category:'Keyword'});
	this.registerAttribute('text',{type:'text',standard:'Keyword',category:'Keyword'});
	
	this.attributeManager.registerAttribute('width',{hidden:true,min:20,max:20,default:20});
	this.attributeManager.registerAttribute('height',{hidden:true,min:20,max:20,default:20});
	this.attributeManager.registerAttribute('fillcolor',{hidden:true});
	
}

SimpleKeyword.isResizable=function(){
	return false;
}

SimpleKeyword.register('SimpleKeyword');
SimpleKeyword.isCreatable=true;

SimpleKeyword.category='Evaluations';

module.exports=SimpleKeyword;