/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js')
var Test=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Test.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeSensitive();
	
	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

Test.isCreatable=true; 
Test.category = 'Active';


module.exports=Test;