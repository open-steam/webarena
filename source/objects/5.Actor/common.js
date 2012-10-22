/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js');
var Actor=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Actor.register=function(type){
	
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type); //super call
	
	this.registerAttribute('width',{hidden:true,min:35,max:35,default:35});
	this.registerAttribute('height',{hidden:true,min:35,max:35,default:35});
	
}

Actor.register('Actor');
Actor.isCreatable=false;
Actor.isActor=true;

Actor.category='Evaluations';

module.exports=Actor;