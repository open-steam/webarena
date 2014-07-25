/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Subroom=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Subroom.register=function(type){
	
	// Registering the object
	
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	IconObject.registerAttribute('onMobile', {type:'boolean', standard:false, category:'Basic', mobile: false});
	
	var self=this;
	
	this.registerAction('Follow',function(object){
		
		object.execute();
		
	},true);
	
	this.registerAction('Open in new window',function(object){
		
		object.execute(true);
		
	},true);
	
}

Subroom.execute=function(openInNewWindow){
	
	var destination=this.getAttribute('destination');
	
	//TODO this must be done serverside in the connector
	if (!destination) {
		var random=new Date().getTime()-1296055327011;
		
		this.setAttribute('destination',random);
		destination = random;
	}
	
	if (openInNewWindow) { window.open(destination); }
	else { ObjectManager.loadRoom(destination,false,ObjectManager.getIndexOfObject(this.getAttribute('id'))); }}

Subroom.register('Subroom');
Subroom.isCreatable=true;
Subroom.onMobile = true;
Subroom.isCreatableOnMobile = true;

module.exports=Subroom;