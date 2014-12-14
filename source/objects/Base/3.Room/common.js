/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Room=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

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
	this.registerAttribute('bigIcon',{hidden:true});
	this.registerAttribute('linecolor',{hidden:true});
	this.registerAttribute('linesize',{hidden:true});
	this.registerAttribute('destination', {hidden:'true'});
	this.registerAttribute('open destination on double-click',{type:'boolean',hidden:true,standard:false,category:'Functionality'});
	this.registerAttribute('open in',{type:'selection',standard:'same Tab',hidden:true,options:['same Tab','new Tab','new Window'],category:'Functionality'});
	
	this.registerAttribute('showUserPaintings',{type:"boolean", standard:true, changedFunction: function(object, value) {object.showUserPaintings(value);}});
	this.registerAttribute('showLinks',{type:"boolean", standard:true, changedFunction: function(object, value) {GUI.showLinks(value);}});
    
}

/*
Room.hasObject=function(obj){
	var inventory=this.getInventory();
	for (var i in inventory){
		if (inventory[i].id==obj.id) return true;
	}
	return false;
}
*/

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

module.exports=Room;