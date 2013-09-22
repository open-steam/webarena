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

	this.unregisterAction('Duplicate');
	
	this.registerAction('Follow',function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var object = selected[i];
			
			object.execute();
			
		}
		
	},true);
	
	
}

Subroom.execute=function(){
	
	var destination=this.getAttribute('destination');
	
	if (!destination) {
		var random=new Date().getTime()-1296055327011;
		
		this.setAttribute('destination',random);
		destination = random;
	}
	
	ObjectManager.loadRoom(destination,false,ObjectManager.getIndexOfObject(this.getAttribute('id')));
	
}

Subroom.register('Subroom');
Subroom.isCreatable=true;

Subroom.category='Rooms';

module.exports=Subroom;