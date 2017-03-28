/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var ObjectChooser=Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

ObjectChooser.register=function(type){
	
	// Registering the object
	
	HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
	HtmlObject.register.call(this,type);
	
	this.registerAttribute('width',{min:250,max:250,standard:250});
	this.registerAttribute('Targetroom', {type: 'text', standard: 'undefined'});
}

ObjectChooser.isCreatable=false;

ObjectChooser.contentURLOnly = false;

module.exports=ObjectChooser;