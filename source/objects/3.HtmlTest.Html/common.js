/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var HtmlTest=Object.create(Modules.ObjectManager.getPrototype('HtmlObject'));

HtmlTest.register=function(type){
	
	// Registering the object
	
	HtmlObject=Modules.ObjectManager.getPrototype('HtmlObject');
	HtmlObject.register.call(this,type);
	
}



HtmlTest.register('HtmlTest');
HtmlTest.isCreatable=true;

HtmlTest.contentURLOnly = false;
HtmlTest.category='Texts';

module.exports=HtmlTest;