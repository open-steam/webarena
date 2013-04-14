/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Subroom=Object.create(Modules.ObjectManager.getPrototype('BidExit'));

Subroom.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.unregisterAction('Duplicate');
	
}

Subroom.execute=function(){
	
	var destination=this.getAttribute('destination');
	
	if (!destination) {
		return;
	}
	
	ObjectManager.loadRoom(destination);
	
}

Subroom.upload=function(){
	
	var random=new Date().getTime()-1296055327011;
	
	this.setAttribute('destination',random);
}

Subroom.register('Subroom');

Subroom.category='Rooms';

module.exports=Subroom;