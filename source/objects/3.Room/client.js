/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


Room.getInventory=function(){
	return Modules.ObjectManager.getObjects();
}


Room.saveUserPaintingData=function(content){
	this.serverCall('saveUserPaintingData', content, function(){
		//update the view
	});
}

Room.getUserPaintings=function(callback){
	this.serverCall('getUserPaintings', callback);
}

Room.deleteUserPainting=function(){
	this.serverCall('deleteUserPainting', function(){
		//update the view
	});	
}