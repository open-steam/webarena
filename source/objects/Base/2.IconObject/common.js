/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

var Modules = require('../../../server.js');

var IconObject = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

IconObject.isCreatable = false;

IconObject.onMobile = true;
IconObject.hasMobileRep = true;

IconObject.category = 'Objects';

IconObject.register = function(type) {

    // Registering the object
    GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this, type); //super call

    this.attributeManager.registerAttribute('layer', {hidden: true});
    this.registerAttribute('bigIcon', {type: 'boolean', standard: true, changedFunction: function(object) {
            object.updateIcon();
        }, mobile: false});
    this.registerAttribute('fillcolor', {hidden: true});
    this.registerAttribute('onMobile', {type: 'boolean', standard: false, category: 'Basic', mobile: false});
    this.registerAttribute('modeSensitive', {type: 'boolean', standard: false, category: 'Basic', mobile: false});
    this.registerAttribute('structureStates', {type: 'array', standard: [], hidden: true});
    this.registerAttribute('isPositioned', {type: 'boolean', standard: true, hidden: true});
    //this.registerAttribute('linecolor',{hidden:true});
    //this.registerAttribute('linesize',{hidden:true});
    this.unregisterAction('to back');
    this.unregisterAction('to front');

    this.registerAction('Evaluate Position', function(object) {
        var deleted = object.getAttribute("deleted");
        for (var ele in deleted){
            //object.unsetAttribute(deleted[ele].attribute.toString());
           // console.log(deleted[ele].attribute.toString());
        }
            
        object.setAttribute("deleted", []);
        object.setAttribute("isPositioned", true); 
        alert("TODO: POSITION => PROPERTIES");
      
    });
    this.registerAction('Reposition', function(object) {
        console.log(object);
        object.setAttribute("deleted", []);
        object.setAttribute("isPositioned", true); 
        alert("TODO:PROPERTIES => POSITION");
    });

    this.makeActive(); // Icon object normally are subject to structuring

}


IconObject.isResizable = function() {
    return false;
}

IconObject.moveByTransform = function() {
    return true;
};

IconObject.alwaysOnTop = function() {
    return true;
};

IconObject.register('IconObject');

module.exports = IconObject;