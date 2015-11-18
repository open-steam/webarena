/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

var Modules = require('../../../server.js')
var Scale2 = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Scale2.register = function(type) {

    // Registering the object
    Modules.ObjectManager.getPrototype('Rectangle').register.call(this, type);
    this.makeStructuring();

    this.registerAttribute('attributeX', {type: 'text', standard: '', category: 'Scale2'});
    this.registerAttribute('attributeY', {type: 'text', standard: '', category: 'Scale2'});

    this.registerAttribute('linestyleX', {type: 'selection', standard: 'stroke', options: ['stroke', 'dotted', 'dashed'], category: 'Appearance'});
    this.registerAttribute('linestyleY', {type: 'selection', standard: 'stroke', options: ['stroke', 'dotted', 'dashed'], category: 'Appearance'});


    this.registerAttribute('minX', {type: 'number', standard: 1, category: 'Scale2'});
    this.registerAttribute('maxX', {type: 'number', standard: 5, category: 'Scale2'});

    this.registerAttribute('minY', {type: 'number', standard: 1, category: 'Scale2'});
    this.registerAttribute('maxY', {type: 'number', standard: 5, category: 'Scale2'});

    this.registerAttribute('steppingX', {type: 'number', standard: 1, min: 1, category: 'Scale2'});
    //this.registerAttribute('distinctX', {type: 'boolean', standard: false, category: 'Scale2'});
    //this.registerAttribute('orientationX', {type: 'selection', standard: 'bottom', options: ['bottom', 'top', 'left', 'right'], category: 'Scale2'});

    this.registerAttribute('steppingY', {type: 'number', standard: 1, min: 1, category: 'Scale2'});
    //this.registerAttribute('distinctY', {type: 'boolean', standard: false, category: 'Scale2'});
    //this.registerAttribute('orientationY', {type: 'selection', standard: 'bottom', options: ['bottom', 'top', 'left', 'right'], category: 'Scale2'});
    
    this.registerAttribute('labelX', {type: 'text',standard: '', category: 'Scale2'});
    this.registerAttribute('labelY', {type: 'text', standard: '', category: 'Scale2'});

    
    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';

}

Scale2.isCreatable = true;

Scale2.decideIfActive = function(object) {
    return true;
}


module.exports = Scale2;