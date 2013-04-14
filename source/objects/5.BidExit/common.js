/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var BidExit=Object.create(Modules.ObjectManager.getPrototype('BidFile'));

BidExit.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAction(this.translate(this.currentLanguage, "Change destination"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	});
	
}

BidExit.execute=function(){
	
	var destination=this.getAttribute('destination');
	
	if (!destination) {
		return this.upload();
	}
	
	ObjectManager.loadRoom(destination);
	
}


BidExit.register('BidExit');
BidExit.isCreatable=true;

//BidExit.moveByTransform = function(){return true;};

BidExit.category='Rooms';

module.exports=BidExit;