/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Gate=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Gate.register=function(type){
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	this.registerAttribute('destination', {type: 'Hyperlink', standard: "choose", linkFunction: function(object) {
            Gate.showLinklDialog(object);
        }, category: 'Hyperlink', changedFunction: function(object) {
            if(object.updateIcon){object.updateIcon()};
        }});
    this.registerAttribute('destinationObject', {type: 'Hyperlink', standard: "choose", hidden: true, linkFunction: function(object) {
            object.showExitDialog()
        }, category: 'Hyperlink'});
    this.registerAttribute('filterObjects', {type: 'boolean', standard: false, hidden: true});
		
	this.registerAttribute('open in',{type:'selection',standard:'same Tab',options:['same Tab','new Tab','new Window'],category:'Hyperlink'});
		
	this.registerAttribute('filterObjects',{type:'boolean',standard:false, hidden:true});



};

/**
* execute when object double-clicked
*/
Gate.execute=function(){
	if(this.getAttribute("destination") == "choose"){
		this.showLinklDialog(this);
	}else{
		this.follow();
	}
		
	
}

/**
* set new destination
* 	destination: Room-ID of target room
*/
Gate.saveDestination = function(destination){
	this.setAttribute("destination",destination);
};

/**
* open destination room
*/

Gate.follow = function(){
	ObjectManager.loadRoom(this.getAttribute("destination"));
}
Gate.isCreatable=true;
Gate.moveByTransform = function(){return true;};

module.exports=Gate; 