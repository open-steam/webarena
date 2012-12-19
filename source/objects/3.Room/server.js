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
	
	var objects=this.getInventory();
	var semanticObjects=this.getSemanticObjects(objects);  //idea hold semantic objects yet in ObjectManager for speedup
	
	for (var j in objects){	
		
		var greens=[];
		var reds=[];
		
		var dataObject=objects[j];
		for (var i in semanticObjects){
			var semanticObject=semanticObjects[i];
			if (dataObject.isSemanticObject) continue;
			var g=semanticObject.getGreenPositions(dataObject);
			var r=semanticObject.getRedPositions(dataObject);
			
			if (g) greens.push(g);
			if (r) reds.push(r);
		}
		
		//calculte the overlapping green
		var green=false;
		
		if (greens.length){
			
			var green={x:-500000,y:-500000,x2:500000,y2:500000};
			
			
			
			for (var i in greens){
				var thisGreen=greens[i];
			
				thisGreen.x2=thisGreen.x+thisGreen.width;
				thisGreen.y2=thisGreen.y+thisGreen.height;
				
				if (thisGreen.x>green.x) green.x=thisGreen.x;
				if (thisGreen.y>green.y) green.y=thisGreen.y;
				if (thisGreen.x2<green.x2) green.x2=thisGreen.x2;
				if (thisGreen.y2<green.y2) green.y2=thisGreen.y2;
				
			}
			
		}
		
		if (checkPosition(dataObject,green,reds)) continue;
		
		console.log(dataObject+' NEEDS REPOSITIONING');
		
		var position=getPosition(dataObject,green,reds);
		
		dataObject.setAttribute('x',position.x);
		dataObject.setAttribute('y',position.y);
		
	}
	
}

function getPosition(dataObject,green,reds){
	
	for (var x=green.x;x<=green.x2;x++){
		for (var y=green.y;x<green.y2;y++){
			
			var inRed=false;
			for (var i in reds){
				var red=reds[i];
				if ((x>red.x && x+w<red.x2) && (y>red.y && y+h<red.y2)){
					red=true;
					break;
				}
			}
			if (inRed) continue;
			
			return {'x':x,'y':y};
		}
	}
	
	return false;
	
}

function checkPosition(dataObject,green,reds){
	
	var x=dataObject.getAttribute('x');
	var y=dataObject.getAttribute('y');
	var w=dataObject.getAttribute('width');
	var h=dataObject.getAttribute('height');
	
	if (green){
		if (x<green.x ||x+w>green.x2 || y<green.y ||y+h>green.y2){
			console.log(dataObject+' out of green');
			return false;
		}
	} else {
		console.log(dataObject+' has no green');
	}
	
	if (reds.length){
		for (var i in reds){
			var red=reds[i];
			if ((x>red.x && x+w<red.x2) && (y>red.y && y+h<red.y2)){
				console.log(dataObject+' in red');
				return false;
			}
		}
	} else {
		console.log(dataObject+' has no red');
	}
	
	console.log('Position of '+dataObject+' is okay.');
	return true;
	
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