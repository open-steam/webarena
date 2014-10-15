/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

var Modules = require('../../../server.js');

var Topology = Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Topology.register = function(type) {

    // Registering the object

    GeneralObject = Modules.ObjectManager.getPrototype('GeneralObject');
    GeneralObject.register.call(this, type);

    this.registerAttribute('width', {type: 'number', min: 0, standard: 100, unit: 'px', category: 'Dimensions'});
    this.registerAttribute('height', {type: 'number', min: 0, standard: 100, unit: 'px', category: 'Dimensions'});

    this.registerAttribute('direction', {type: 'number', standard: 4, readonly: false, hidden: true});

    this.attributeManager.registerAttribute('linesize', {type: 'number', min: 1, standard: 4, category: 'Appearance'});
    this.attributeManager.registerAttribute('linestyle', {type: 'selection', standard: 'stroke', options: ['stroke', 'dotted', 'dashed'], category: 'Appearance'});
    this.attributeManager.registerAttribute('linecolor', {standard: 'black'});


    this.registerAttribute('fillcolor', {hidden: true});

}

Topology.register('Line');
Topology.isCreatable = true;

Topology.moveByTransform = function() {
    return true;
}


Topology.controlIsAllowed = function(control) {
    var list = {
        "xy1": (this.getAttribute("direction") == 1 || this.getAttribute("direction") == 3),
        "xy2": (this.getAttribute("direction") == 2 || this.getAttribute("direction") == 4),
        "xy3": (this.getAttribute("direction") == 1 || this.getAttribute("direction") == 3),
        "xy4": (this.getAttribute("direction") == 2 || this.getAttribute("direction") == 4)
    };
    return (list[control]);
}

Topology.ignoreMinDimensions = true;



module.exports = Topology;