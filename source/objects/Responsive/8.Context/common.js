/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var Context=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Context.isContext = function(){
    return true;
}

Context.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeStructuring();
	
        this.registerAttribute('structures',{type:'object'});
        this.registerAttribute('activeObjects',{type:'object'});
	
}

Context.isCreatable=true; 

Context.decideIfActive = function(object){

	return true;
}


module.exports=Context;