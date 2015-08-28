/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules = require('../../../server.js');

var Subroom = Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Subroom.register = function(type) {
	
	// Registering the object
	
	IconObject = Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this, type);
	IconObject.registerAttribute('onMobile', {type:'boolean', standard:true, category:'Basic', mobile: false});
	
	this.registerAttribute('destination', {type:'metadata', category: 'Functionality'});
	this.registerAttribute('open destination on double-click', { type:'boolean', standard:true, hidden:true, category:'Functionality' } );
	
	var self = this;
	
	this.registerAction('Open destination', function(object) {
        object.follow(object.getAttribute("open in"));
    }, true);
	
}

Subroom.register('Subroom');
Subroom.isCreatable = true;
Subroom.onMobile = true;
Subroom.isCreatableOnMobile = true;

module.exports = Subroom;
