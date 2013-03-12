/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


Room.getContext=function(){
	return this.getAttribute('local_context');
}

Room.contextSwitch=function(){
	var objects=ObjectManager.getObjects();
	for (var i in objects){
		var object=objects[i];
		object.drawDimensions(true);
	}
}