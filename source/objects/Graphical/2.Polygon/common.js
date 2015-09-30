/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Polygon=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * TODO: remove, is not used any more
 */
Polygon.duplicateWithLinkedObjects = false; //duplicate this object if a linked object gets duplicated
Polygon.duplicateLinkedObjects = true; //duplicate linked objects if this object gets duplicated


Polygon.register=function(type){
	
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	// Registering attributes circle

	this.registerAttribute('edges',{type:'number',standard:6,min:3,category:'Appearance'});
	this.registerAttribute('rotation',{type:'number',standard:0,min:0,category:'Appearance'});

	this.registerAttribute('opacity', {type: 'number', min: 10, max: 100, standard: 100, category: 'Appearance', stepsize: 10});
	
}

Polygon.register('Polygon');
Polygon.isCreatable=true;
Polygon.moveByTransform = function(){return true;};

module.exports=Polygon;