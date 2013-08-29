/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Subroom=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Subroom.register=function(type){
	
	// Registering the object
	
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	var self=this;
	
	this.registerAction('Follow',function(){
		
		self.execute();
		
	},true);
	
	
}

Subroom.execute=function(){
	
	var destination=this.getAttribute('destination');
	
	//TODO this must be done serverside in the connector
	if (!destination) {
		var random=new Date().getTime()-1296055327011;
		
		this.setAttribute('destination',random);
		destination = random;
	}
	
	ObjectManager.loadRoom(destination);
	
}

Subroom.register('Subroom');
Subroom.isCreatable=true;

Subroom.category='Rooms';

module.exports=Subroom;