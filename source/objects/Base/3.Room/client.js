/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/


Room.getInventory=function(){
	return Modules.ObjectManager.getObjects();
}

Room.redraw=function(){	var inventory=this.getInventory();	for (var i in inventory){		var obj=inventory[i];		obj.draw();	}}

Room.clearTrash=function(){
    var currentRoomID = ObjectManager.getCurrentRoom().id;
    this.serverCall('clearTrash',function(){
        GUI.trashbasket.update();
	});
}
