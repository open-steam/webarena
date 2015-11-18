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
	this.registerAttribute('parent', {hidden: true});
	this.registerAttribute('chatMessages',{hidden: true, readonly:true, standard: []});
    
	//Hide unnecessary attributes (at least for now)
    
    this.registerAttribute('locked',{hidden:true});
	this.registerAttribute('visible',{hidden:true});
    this.registerAttribute('x',{hidden:true});
	this.registerAttribute('y',{hidden:true});
	this.registerAttribute('group',{hidden:true});
	this.registerAttribute('bigIcon',{hidden:true, changedFunction: function(object) {}});
	this.registerAttribute('linecolor',{hidden:true});
	this.registerAttribute('linesize',{hidden:true});
	
	this.registerAttribute('showUserPaintings',{type:"boolean", standard:true, changedFunction: function(object, value) {object.showUserPaintings(value);}});
	this.registerAttribute('showLinks',{type:"boolean", standard:true, changedFunction: function(object, value) {GUI.showLinks(value);}});
    
    if (Modules.Config.structuringMode) {        this.attributeManager.registerAttribute('mode', {type: 'selection', standard: 'foreground', options: ['background', 'foreground'], category: 'Structure', hidden: true, changedFunction: function(room) {                GUI.deselectAllObjects();                room.redraw();                GUI.setMode(room.getAttribute('mode'));            }});    }
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

Room.isInBackgroundMode = function() {    var mode = this.getAttribute('mode');    if (mode == 'background')        return true;    return false;}Room.switchMode = function(mode) {    if (mode == 'background')        this.setAttribute('mode', 'background');    else        this.setAttribute('mode', 'foreground');}

Room.register('Room');
Room.isCreatable=false;

module.exports=Room;