/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Valuetable=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Valuetable.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);

	
	this.attributeManager.registerAttribute('x-min',{hidden:false, standard:'-5', category:'Table-Settings'});
	this.attributeManager.registerAttribute('x-max',{hidden:false, standard:'5', category:'Table-Settings'});
	this.attributeManager.registerAttribute('interval',{hidden:false, standard:'1', category:'Table-Settings'});
	this.attributeManager.registerAttribute('highlighted X-Value',{hidden:false, standard:'x value', category:'Table-Settings'});
	
	this.attributeManager.registerAttribute('width',{hidden:true});
	this.attributeManager.registerAttribute('height',{hidden:true});


	
}
Valuetable.isResizable=function(){
	return false;
}

Valuetable.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "Valuetable" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}

Valuetable.register('Valuetable');
Valuetable.isCreatable=true;

Valuetable.contentURLOnly = false; //content is only accessible via URL

Valuetable.moveByTransform = function(){return true;};

Valuetable.justCreated=function(){
}

module.exports=Valuetable;