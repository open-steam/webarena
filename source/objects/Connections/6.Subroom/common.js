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
	
	this.registerAttribute('destination', {type:'metadata', category: 'Functionality'});
	this.registerAttribute('open destination on double-click',{type:'boolean',standard:true,hidden:true,category:'Functionality'});
	
	var self=this;
	
	this.registerAction('Open destination', function(object) {
        object.follow(object.getAttribute("open in"));
    }, true);
	
}

/*
Subroom.execute=function(openMethod){
	
	var destination=this.getAttribute('destination');
		
	if(openMethod == 'new Tab'){
		window.open(destination);
		return;
	}
	if(openMethod == 'new Window'){
		var newWindow = window.open(destination, Modules.Config.projectTitle, "height="+window.outerHeight+", width="+window.outerWidth);
		return;
    }
	
	//open in same tab
	ObjectManager.loadRoom(destination, false, ObjectManager.getIndexOfObject(this.getAttribute('id')));
	
}
*/

Subroom.register('Subroom');
Subroom.isCreatable=true;
Subroom.onMobile = true;
Subroom.isCreatableOnMobile = true;

module.exports=Subroom;