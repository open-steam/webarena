/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var PyramidElement=Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

PyramidElement.register=function(type){
	
	// Registering the object
	
	HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
	HtmlObject.register.call(this,type);
	
}

PyramidElement.isCreatable=true;

PyramidElement.contentURLOnly = false;

module.exports=PyramidElement;