/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

var Modules = require('../../../server.js')
var TimeLine = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

TimeLine.register = function(type) {

    // Registering the object
    Modules.ObjectManager.getPrototype('Rectangle').register.call(this, type);
    this.makeStructuring();

    this.registerAttribute('attribute', {type: 'text', standard: '', category: 'TimeLine'});

    this.registerAttribute('linestyle', {type: 'selection', standard: 'stroke', options: ['stroke', 'dotted', 'dashed'], category: 'Appearance'});

    this.registerAttribute('min', {type: 'number', standard: 1, category: 'TimeLine'});
    this.registerAttribute('max', {type: 'number', standard: 5, category: 'TimeLine'});
    this.registerAttribute('stepping', {type: 'number', standard: 1, min: 1, category: 'TimeLine'});
    /*this.registerAttribute('distinct',{type:'boolean',standard:false,category:'Scale'});
     this.registerAttribute('orientation',{type:'selection',standard:'bottom',options:['bottom','top','left','right'],category:'Scale'});
     */
    this.registerAttribute('direction', {type: 'selection', standard: 'horizontal', options: ['horizontal', 'vertical'], category: 'TimeLine'});
    this.registerAttribute('label', {category: 'TimeLine'})
    this.registerAttribute('vertical-align', {hidden:true});
    this.registerAttribute('horizontal-align', {hidden:true});
    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';

}

TimeLine.isCreatable = true;

TimeLine.decideIfActive = function(object) {

    return true;
}


module.exports = TimeLine;