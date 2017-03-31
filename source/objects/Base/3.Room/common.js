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
	this.registerAttribute('showCaption',{hidden:true});
	
	this.registerAttribute('showLinks',{type:"boolean", standard:true, changedFunction: function(object, value) {GUI.showLinks(value);}});
	
    
    if (Modules.Config.structuringMode) {        this.attributeManager.registerAttribute('mode', {type: 'selection', standard: 'foreground', options: ['background', 'foreground'], category: 'Structure', hidden: true, changedFunction: function(room) {                GUI.deselectAllObjects();                room.redraw();
                
                var mode=room.getAttribute('mode');
                                GUI.setMode(mode);
                
                
                            }});    }
}


Room.isInBackgroundMode = function() {    var mode = this.getAttribute('mode');    if (mode == 'background')        return true;    return false;}Room.switchMode = function(mode) {    if (mode == 'background')        this.setAttribute('mode', 'background');    else        this.setAttribute('mode', 'foreground');}

Room.getRoomID = function() {
	
	//This is a fix where in cases where a room was just loading, the getRoomId of the room responded with a wrong answer.
	//TODO: Check, where the inRoom property is set which should have had the correct value
	
    return this.id;
}

Room.register('Room');
Room.isCreatable=false;

module.exports=Room;