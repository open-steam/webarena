/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Graphboard=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Graphboard.register=function(type){
	var that = this;
	// Registering the object	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.attributeManager.registerAttribute('width',{hidden:true});
	this.attributeManager.registerAttribute('height',{hidden:true});
	this.attributeManager.registerAttribute('fillcolor',{hidden:true});
	
	
	this.standardData.width=200;
    this.standardData.height=100;
	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);

	
}

Graphboard.execute=function(){
	//
}

Graphboard.isResizable=function(){
	return true;
}

Graphboard.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "Graphboard" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}

Graphboard.register('Graphboard');
Graphboard.isCreatable=true;

Graphboard.contentURLOnly = false; //content is only accessible via URL

Graphboard.moveByTransform = function(){return true;};

Graphboard.justCreated=function(){
}

module.exports=Graphboard;