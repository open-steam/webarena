/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../server.js')
var Group=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Group.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeStructuring();
	
	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

Group.isCreatable=true; 
Group.category = 'Structuring';


Group.decideIfActive = function(object){

	return true;
}


module.exports=Group;