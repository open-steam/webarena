/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Room=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Room.register=function(type){
	
    // Registering the object
    IconObject=Modules.ObjectManager.getPrototype('IconObject');
    IconObject.register.call(this,type);
    
    this.registerAttribute('standard_context',{standard:'general',readable:'standard context',category:'Context'});
    this.registerAttribute('local_context',{type:'selection',options:['general','different','alternative'],standard:'general',readable:'current context',category:'Context',changedFunction: 
	    function(object, value, local) {
			if (local) {
				object.contextSwitch();
			}
		}});
}

Room.execute=function(){
	var destination=this.getAttribute('id');	
	ObjectManager.loadRoom(destination);
}

Room.getContext=function(){
	return this.getAttribute('local_context');
}

Room.register('Room');
Room.isCreatable=false;

Room.category = 'Rooms';

module.exports=Room;