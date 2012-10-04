/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Room=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Room.execute=function(){
	var destination=this.getAttribute('id');	
	ObjectManager.loadRoom(destination);
}

Room.register('Room');
Room.isCreatable=false;

Room.category = 'Rooms';

module.exports=Room;