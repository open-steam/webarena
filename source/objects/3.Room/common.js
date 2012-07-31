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

//returns the Evaluated position of an object. returns false if an object cannot be positioned
Room.getEvaluatedPositionFor=function(obj){
	return false;
}

//evaluates the position for an object. If there was no evaluation, false is returned.
//if there was one, it returns an array of attributes which shall be set
Room.evaluatePositionFor=function(obj,x,y){
	return false;
}

module.exports=Room;