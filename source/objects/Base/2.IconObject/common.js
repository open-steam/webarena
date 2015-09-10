/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

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
	this.registerAttribute('bigIcon',{type:'boolean',standard:true, changedFunction: function(object) { if(object) {object.updateIcon();} }, mobile: false});
	this.registerAttribute('width',{hidden:true});
	this.registerAttribute('height',{hidden:true});
	this.registerAttribute('fillcolor',{hidden:true});
	this.registerAttribute('onMobile', {type:'boolean', standard:false, category:'Basic', mobile: false});
	this.registerAttribute('linecolor',{hidden:true});
	this.registerAttribute('linesize',{hidden:true});
	this.unregisterAction('To back');
	this.unregisterAction('To front');
        
        this.registerAttribute('width', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("height", object.getAttribute("height") * (value / object.getAttribute("width")));
            }

            return true;

        }, getFunction: function(object) {
            var bigIcon = object.getAttribute("bigIcon");
            if (bigIcon) {
                return "64"
            } else {
                return "32";
            }
        },
        mobile: false});

    this.registerAttribute('height', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("width", object.getAttribute("width") * (value / object.getAttribute("height")));
            }

            return true;

        }, getFunction: function(object) {
            var bigIcon = object.getAttribute("bigIcon");
            if (bigIcon) {
                return "64"
            } else {
                return "32";
            }
        }, mobile: false});

	
}


IconObject.isResizable=function(){
	return false;
}


IconObject.input = false;

IconObject.moveByTransform = function(){return true;};

IconObject.alwaysOnTop = function() {return true;};

IconObject.register('IconObject');

module.exports=IconObject;