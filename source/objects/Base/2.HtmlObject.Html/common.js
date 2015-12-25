/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var HtmlObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

HtmlObject.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
}

HtmlObject.register('HtmlObject');

HtmlObject.isCreatable=false;

module.exports=HtmlObject;