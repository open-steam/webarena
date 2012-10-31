/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Exit=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Exit.register=function(type){
	
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	// Registering attributes circle

	//this.registerAttribute('edges',{type:'number',standard:6,min:3,category:'Appearance'});
	//this.registerAttribute('rotation',{type:'number',standard:0,min:0,category:'Appearance'});
	
	this.registerAttribute('destination',{type:'text',standard:'',category:'Functionality'});
	
	var self=this;
	
	this.registerAction('Follow',function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var object = selected[i];
			
			object.execute();
			
		}
		
	},true);

}

Exit.execute=function(){
	
	var destination=this.getAttribute('destination');
	
	if (!destination) return;
	
//	ObjectManager.loadRoom(destination);
	
	window.location.href = "/room/"+destination;
	
}

Exit.register('Exit');
Exit.isCreatable=true;
Exit.moveByTransform = true;

Exit.category = 'Rooms';

module.exports=Exit;