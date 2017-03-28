/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var PyramidCreator=Object.create(Modules.ObjectManager.getPrototype('UserChooser'));

PyramidCreator.register=function(type){
	
	// Registering the object
	
	HtmlObject=Modules.ObjectManager.getPrototype('UserChooser');
	HtmlObject.register.call(this,type);
	
}

PyramidCreator.isCreatable=true;

module.exports=PyramidCreator;