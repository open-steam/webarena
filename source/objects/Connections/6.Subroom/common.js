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
	
	this.registerAction('Open destination', function(object) {
        object.follow(object.getAttribute("open in"));
    }, true);
	
}

Subroom.register('Subroom');
Subroom.isCreatable=true;
Subroom.onMobile = true;
Subroom.isCreatableOnMobile = true;

module.exports=Subroom;