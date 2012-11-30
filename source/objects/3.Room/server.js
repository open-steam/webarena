/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');


theObject.evaluatePositionFor=function(object,data){
	//console.log('room','evaluatePositionFor',object.toString(),data);
	
	if (object.isActiveObject) return object.evaluate(data);
	
	var inventory=this.getInventory();
	
	for (var i in inventory){
		var activeObject=inventory[i];
		if (!activeObject.isActiveObject) {
			continue;
		} else {
			activeObject.evaluateObject(object,data);
		}
	}
	
}

theObject.evaluatePositions=function(){
	console.log('room','evluatePositions');
	
	var objects=this.getInventory();
	var semanticObjects=this.getSemanticObjects(objects);  //idea hold semantic objects yet in ObjectManager for speedup
	
	console.log(objects,semanticObjects);
	
}

theObject.getInventory=function(){
	return Modules.ObjectManager.getObjects(this.id,this.context);
}

theObject.getSemanticObjects=function(inventory){
	if (!inventory) inventory=this.getInventory();
	
	var result=[];
	
	for (var i in inventory){
		var object=inventory[i];
		if (object.isSemanticObject) result.push(object);
	}
	
	return result;
}

module.exports=theObject;