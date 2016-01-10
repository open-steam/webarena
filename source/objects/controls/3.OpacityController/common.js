/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Alejandro Sandoval Parra, University of Paderborn, 2012
*
*/

var Modules = require('../../../server.js');

var OpacityController = Object.create(Modules.ObjectManager.getPrototype('IconObject'));

OpacityController.register = function(type) {
	// Registering the object
	IconObject = Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this, type);

	this.registerAttribute('mimeType', {type:'text', standard:'text/plain', readonly:true});

	this.registerAttribute('fillcolor', {hidden: true});
	
	this.registerAttribute('opacity', {type: 'number', min: 10, max: 100, standard: 100, category: 'Appearance', stepsize: 10});
    
	this.registerAttribute('width', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("height", object.getAttribute("height") * (value / object.getAttribute("width")));
            }

            return true;

        }, getFunction: function(object) {
            return object.get('width');
        },
        mobile: false});

    this.registerAttribute('height', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("width", object.getAttribute("width") * (value / object.getAttribute("height")));
            }

            return true;

        }, getFunction: function(object) {
            return object.get('height');
        }
        , mobile: false});
   
	
	this.registerAttribute('onMobile', { type:'boolean', standard:false, category:'Basic', mobile: false });

	this.registerAttribute('Object ID', {type:'text', standard:'', category:'Functionality', readonly:false});

	//////////////////////////////// Actions ///////////////////////////////////////////////////////////////

	this.registerAction('to front', function() {
	
		/* set a very high layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();

        _.each(selected, function (obj) {
			obj.setAttribute("layer", obj.getAttribute("layer") + 999999);
		});
		
		ObjectManager.renumberLayers();
	}, false);
	
	this.registerAction('to back', function() {
		
		/* set a very low layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();

        _.each(selected, function (obj) {
			obj.setAttribute("layer", obj.getAttribute("layer") - 999999);
		});
		
		ObjectManager.renumberLayers();
		
	}, false);
}

OpacityController.execute = function() {
	var id = this.getAttribute("Object ID");

	if (id) {
		this.setOpacity();
	} else {
		$().toastmessage('showToast', {
			text: GUI.translate("Please set the ID of the object to change the opacity"),
			sticky: false,
			position: 'top-left',
			type    : 'notice'
		});
	}
}

OpacityController.isProportional = function() {
	return true;
}

OpacityController.resizeProportional = function() {
	return true;
}

OpacityController.isResizable = function() {
	if (this.hasContent() == true && this.getAttribute("preview") == true) {
		return GeneralObject.isResizable.call(this);
	} else return false; 
}

OpacityController.register('OpacityController');
OpacityController.isCreatable = true;
OpacityController.isCreatableOnMobile = false;
OpacityController.onMobile = false;

OpacityController.moveByTransform = function() { return true; };

OpacityController.alwaysOnTop = function () {
	if (this.hasContent() == true && this.getAttribute("preview") == true) {
		return false;
	} else return true;
};

module.exports = OpacityController;
