/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Graph=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Graph.register=function(type){
	var that = this;
	// Registering the object	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.attributeManager.registerAttribute('width',{hidden:true});
	this.attributeManager.registerAttribute('height',{hidden:true});
	this.attributeManager.registerAttribute('fillcolor',{hidden:true});
	this.attributeManager.registerAttribute('a',{hidden:false,standard:'1', category:'Term-manipulation'});
	this.attributeManager.registerAttribute('b',{hidden:false,standard:'0', category:'Term-manipulation'});
	this.attributeManager.registerAttribute('c',{hidden:false,standard:'0', category:'Term-manipulation'});
//	
//	this.standardData.width=200;
//    this.standardData.height=100;
//	
//	this.registerAction('Edit',function(){
//		$.each(ObjectManager.getSelected(), function(key, object) {
//			object.execute();
//		});
//	}, true);
//
//	
	this.attributeManager.registerAttribute('term',{hidden:false, standard: 'x^2'});
}

Graph.execute=function(){
	//
}

Graph.isResizable=function(){
	return true;
}

Graph.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "Graph" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}

Graph.register('Graph');
Graph.isCreatable=true;

Graph.contentURLOnly = false; //content is only accessible via URL

Graph.moveByTransform = function(){return true;};

Graph.justCreated=function(){
}

module.exports=Graph;