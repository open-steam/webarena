/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2014
 *
 */

var Modules = require('../../../server.js')
var Area = Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Area.register = function(type) {
    // Registering the object
	
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this, type);
    this.makeStructuring();
    
    var random = Math.random();

    this.registerAttribute('attribute', {type: 'text', standard: 'areaExampleAttr-' + random, category: 'Selection'});
    this.registerAttribute('value', {type: 'text', standard: 'areaExampleValue-' + random, category: 'Selection'});
}

Area.getStructuringAttributes=function(){
	var structuringAttribute=this.getAttribute('attribute');
	if (structuringAttribute) return [structuringAttribute];
	return [];
}

Area.isCreatable = true;

module.exports = Area;