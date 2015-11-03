/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var Triangle=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

/**
 * TODO: remove, is not used any more
 */
Triangle.duplicateWithLinkedObjects = false; //duplicate this object if a linked object gets duplicated
Triangle.duplicateLinkedObjects = true; //duplicate linked objects if this object gets duplicated


Triangle.register=function(type){
	
	// Registering the object
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	// Registering attributes circle

	this.registerAttribute('rotation',{type:'number',standard:0,min:0,category:'Appearance'});
	this.registerAttribute('opacity', {type: 'number', min: 10, max: 100, standard: 100, category: 'Appearance', stepsize: 10});
	
}

Triangle.register('Triangle');
Triangle.isCreatable=true;
Triangle.moveByTransform = function(){return true;};

module.exports=Triangle;