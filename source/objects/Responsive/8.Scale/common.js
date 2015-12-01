/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

var Modules = require('../../../server.js')
var Scale = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Scale.register = function(type) {

    // Registering the object
    Modules.ObjectManager.getPrototype('Rectangle').register.call(this, type);
    this.makeStructuring();

    this.registerAttribute('attribute', {type: 'text', standard: '', category: 'Scale'});

    this.registerAttribute('linestyle', {type: 'selection', standard: 'stroke', options: ['stroke', 'dotted', 'dashed'], category: 'Appearance'});

    this.registerAttribute('min', {type: 'number', standard: 1, category: 'Scale'});
    this.registerAttribute('max', {type: 'number', standard: 5, category: 'Scale'});
    this.registerAttribute('stepping', {type: 'number', standard: 1, min: 1, category: 'Scale'});
    /*this.registerAttribute('distinct',{type:'boolean',standard:false,category:'Scale'});
     this.registerAttribute('orientation',{type:'selection',standard:'bottom',options:['bottom','top','left','right'],category:'Scale'});
     */
    this.registerAttribute('direction', {type: 'selection', standard: 'horizontal', options: ['horizontal', 'vertical'], category: 'Scale'});
    this.registerAttribute('label', {category: 'Scale'})
    this.registerAttribute('vertical-align', {hidden:true});
    this.registerAttribute('horizontal-align', {hidden:true});
    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';

}

Scale.getStructuringAttributes=function(){
	
	var result=[];
	
	var attribute=this.getAttribute('attribute');
	if (attribute) result.push(attribute);
	return result;
}

Scale.isCreatable = true;


module.exports = Scale;