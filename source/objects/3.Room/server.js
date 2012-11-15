/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');

theObject.getEvaluatedPositionFor=function(object){
	
	var inventory=this.getInventory();
	
	var greens=[];
	var reds=[];
	
	for (var i in inventory){
		var activeObject=inventory[i];
		if (!activeObject.isActiveObject) continue;
		//console.log(activeObject.toString(),'is an activeObject');
		
		//TODO calculate positions
		
	}
	
	var data={};
	data.x=object.getAttribute('x',true);
	data.y=object.getAttribute('y',true);
	data.width=object.getAttribute('width',true);
	data.height=object.getAttribute('height',true);
	return data;
}

theObject.evaluatePositionFor=function(object,data){
	//console.log('room','evaluatePositionFor',object.toString(),data);
	
	var inventory=this.getInventory();
	
	for (var i in inventory){
		var activeObject=inventory[i];
		if (!activeObject.isActiveObject) continue;
		activeObject.evaluate(object,data);
	}
	
}

theObject.getInventory=function(){
	return Modules.ObjectManager.getObjects(this.id,this.context);
}

module.exports=theObject;