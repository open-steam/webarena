/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var Table=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Table.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeStructuring();
}

Table.isCreatable=true; 

module.exports=Table;