/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Room=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Room.register=function(type){
	
	var ObjectManager=this.ObjectManager;
	
    // Registering the object
    IconObject=Modules.ObjectManager.getPrototype('IconObject');
    IconObject.register.call(this,type);
    
	this.registerAttribute('locked',{hidden:true});
	this.registerAttribute('visible',{hidden:true});
	this.registerAttribute('x',{hidden:true});
	this.registerAttribute('y',{hidden:true});
	this.registerAttribute('group',{hidden:true});

	this.registerAttribute('chatMessages',{hidden: true, readonly:true, standard: []});
    
	//Hide unnecessary attributes (at least for now)
    
    this.registerAttribute('locked',{hidden:true});
	this.registerAttribute('visible',{hidden:true});
    this.registerAttribute('x',{hidden:true});
	this.registerAttribute('y',{hidden:true});
	this.registerAttribute('group',{hidden:true});
	this.registerAttribute('showUserPaintings',{type:"boolean", standard:true, changedFunction: function(object, value) {object.showUserPaintings(value);}});
    
}

Room.execute=function(){
	var destination=this.getAttribute('id');	
	ObjectManager.loadRoom(destination);
}

Room.hasObject=function(obj){
	var inventory=this.getInventory();
	for (var i in inventory){
		if (inventory[i].id==obj.id) return true;
	}
	return false;
}

Room.getPaintingURL = function(user) {
	if (!user) user=this.getCurrentUserName();
	
	//maybe it is necessary to add a time here to get rid of cache issues
	
	return "/paintings/"+this.getRoomID()+"/"+user+"/"+ObjectManager.userHash;
}

Room.showUserPaintings = function(value)
{
	if ( value )
	{ ObjectManager.paintingUpdate(); }
	else
	{ $('img[id^="userPainting_"]').remove(); }
}

Room.register('Room');
Room.isCreatable=false;

Room.category = 'Rooms';

module.exports=Room;