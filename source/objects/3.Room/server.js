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

theObject.getInventory=function(){
	return Modules.ObjectManager.getObjects(this.id,this.context);
}

module.exports=theObject;