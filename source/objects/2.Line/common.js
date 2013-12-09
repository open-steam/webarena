/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Line=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Line.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);

	this.registerAttribute('width',{type:'number',min:0,standard:100,unit:'px',category:'Dimensions'});
	this.registerAttribute('height',{type:'number',min:0,standard:100,unit:'px',category:'Dimensions'});
	
	this.registerAttribute('direction',{type:'number',standard:1,readonly:false,hidden:true});
	
    this.attributeManager.registerAttribute('linesize',{type:'number',min:4,standard:4,category:'Appearance'});
    this.attributeManager.registerAttribute('linestyle',{type:'selection',standard:'stroke',options:['stroke','dotted','dashed'],category:'Appearance'});
	this.attributeManager.registerAttribute('linecolor',{standard:'black'});
	

	this.registerAttribute('fillcolor',{hidden:true});

}

Line.register('Line');
Line.isCreatable=true;

Line.moveByTransform = function() { return true; }


Line.controlIsAllowed = function(control) {
	var list = {
		"xy1" : (this.getAttribute("direction") == 1 || this.getAttribute("direction") == 3),
		"xy2" : (this.getAttribute("direction") == 2 || this.getAttribute("direction") == 4),
		"xy3" : (this.getAttribute("direction") == 1 || this.getAttribute("direction") == 3),
		"xy4" : (this.getAttribute("direction") == 2 || this.getAttribute("direction") == 4)
	};
	return (list[control]);
}

Line.ignoreMinDimensions = true;



module.exports=Line;