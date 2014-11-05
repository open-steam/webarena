/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var Matrix=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Matrix.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeStructuring();
	
	this.registerAttribute('Row',{type:'list', category:'Matrix'});
	this.registerAttribute('Column',{type:'list', category:'Matrix'});
        
        this.standardData.fillcolor='white';
	this.standardData.linecolor='black';

}

Matrix.isCreatable=true; 

Matrix.decideIfActive = function(object){

	return true;
}


module.exports=Matrix;