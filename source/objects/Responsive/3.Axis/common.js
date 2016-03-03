/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

var Modules = require('../../../server.js')
var Axis = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Axis.register = function(type) {

    // Registering the object
    Modules.ObjectManager.getPrototype('Rectangle').register.call(this, type);
    this.makeStructuring();

    this.registerAttribute('attribute', {type: 'text', standard: '', category: 'Axis'});

    this.registerAttribute('linestyle', {type: 'selection', standard: 'stroke', options: ['stroke', 'dotted', 'dashed'], category: 'Appearance'});

    this.registerAttribute('min', {type: 'number', standard: 1, category: 'Axis'});
    this.registerAttribute('max', {type: 'number', standard: 10, category: 'Axis'});
    this.registerAttribute('stepping', {type: 'number', standard: 1, min: 1, category: 'Axis'});
    this.registerAttribute('distinct',{type:'boolean',standard:false,category:'Axis'});

    this.registerAttribute('label', {category: 'Axis'})
    this.registerAttribute('vertical-align', {hidden:true});
    this.registerAttribute('horizontal-align', {hidden:true});
    this.standardData.fillcolor = 'white';
    this.standardData.linecolor = 'black';

}

Axis.getStructuringAttributes=function(){
	
	var result=[];
	
	var attribute=this.getAttribute('attribute');
	if (attribute) result.push(attribute);
	return result;
}

Axis.isCreatable = true;


module.exports = Axis;