/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var List=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

List.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	this.makeStructuring();
	
	this.registerAttribute('attribute',{type:'text',standard:'',category:'List'});
	
	//Determines the distance between to items
	this.registerAttribute('distance',{type:'number',standard:10,min:5,max: 100,category:'List'});
	this.registerAttribute('direction',{type:'selection', standard:'y', options:['y','x'], category:'List'});
        
        this.standardData.fillcolor='white';
	this.standardData.linecolor='black';

}

List.isCreatable=true; 

List.decideIfActive = function(object){

	return true;
}


module.exports=List;