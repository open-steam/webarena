/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Set=Object.create(Modules.ObjectManager.getPrototype('EvaluationObject'));

Set.register('Set');
Set.isCreatable=false; 

Set.getPossiblePositionsFor=function(obj){
	
	return [];
	
}

Set.getForbiddenPositionsFor=function(obj){
	
	return [];
	
}

Set.evaluatePosition=function(obj,x,y){
	return false;
}

Set.isActive=function(){
	return true;
}

module.exports=Set;