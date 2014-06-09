/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var IconObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

IconObject.isCreatable=false;

IconObject.onMobile = true;
IconObject.hasMobileRep = true;

IconObject.category='Objects';

IconObject.register=function(type){
	
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type); //super call
	
	this.attributeManager.registerAttribute('layer',{hidden: true});
	this.registerAttribute('bigIcon',{type:'boolean',standard:true, changedFunction: function(object) { object.updateIcon(); }, mobile: false});
	this.registerAttribute('width',{hidden:true});
	this.registerAttribute('height',{hidden:true});
	this.registerAttribute('fillcolor',{hidden:true});
	this.registerAttribute('onMobile', {type:'boolean', standard:false, category:'Basic', mobile: false});
	//this.registerAttribute('linecolor',{hidden:true});
	//this.registerAttribute('linesize',{hidden:true});
	this.unregisterAction('to back');
	this.unregisterAction('to front');
	
}


IconObject.isResizable=function(){
	return false;
}

IconObject.moveByTransform = function(){return true;};

IconObject.alwaysOnTop = function() {return true;};

IconObject.register('IconObject');

module.exports=IconObject;