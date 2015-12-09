/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var ValueChanger=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

ValueChanger.register=function(type){
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('IconObject');
	GeneralObject.register.call(this,type);
}


ValueChanger.execute=function(){
	var inventory=ObjectManager.getInventory();
	
	function getRandomInt(min, max) {
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	for (var i in inventory){
		var object=inventory[i];
		if (object.getAttribute('type')=='File'){
			
			var random=getRandomInt(0,5);
			
			object.setAttribute('debug1',random);
			
			object.shout('Value of '+this+' has been set to '+random);
			
			break;
		}
	}
}

ValueChanger.isCreatable=true;

module.exports=ValueChanger;