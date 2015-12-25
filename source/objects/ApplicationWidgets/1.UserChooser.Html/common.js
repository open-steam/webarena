/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var UserChooser=Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

UserChooser.register=function(type){
	
	// Registering the object
	
	HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
	HtmlObject.register.call(this,type);
	
	this.registerAttribute('width',{min:250,max:250,standard:250});
	this.registerAttribute('height',{min:500,max:300,standard:300});
	
}

UserChooser.isCreatable=true;

UserChooser.contentURLOnly = false;

module.exports=UserChooser;