/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Weblink=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Weblink.register=function(type){
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	var that = this;
	this.registerAttribute('destination', {type: 'Hyperlink', standard: "choose", linkFunction: function(object) {
            Weblink.showLinklDialog(object);
        }, category: 'Hyperlink'});

    this.registerAttribute('filterObjects', {type: 'boolean', standard: false, hidden: true});
		
	this.registerAttribute('filterObjects',{type:'boolean',standard:false, hidden:true});
};

/**
* execute when object double-clicked
*/
Weblink.execute=function(event){
	var that = this;
	
	if(this.getAttribute("destination") == "choose"){
		Weblink.showLinklDialog(that);
	}else {
		Weblink.openURL(that.getAttribute("destination"))
	}
}

/**
* set new destionation
*	destination: URL of Website
*/
Weblink.saveDestination = function(destination){
	this.setAttribute("destination",destination);
};

Weblink.isCreatable=true;
Weblink.moveByTransform = function(){return true;};

module.exports=Weblink; 