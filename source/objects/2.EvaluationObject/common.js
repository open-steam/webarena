/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var EvaluationObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

EvaluationObject.register('EvaluationObject');
EvaluationObject.category = 'Evaluations';
EvaluationObject.isCreatable=true;  //TODO should be false
EvaluationObject.isEvaluatable=true;

EvaluationObject.getPossiblePositionsFor=function(obj){
	
	return [];
	
}

EvaluationObject.getForbiddenPositionsFor=function(obj){
	
	return [];
	
}

EvaluationObject.evaluatePosition=function(obj,x,y){
	return true;
}

EvaluationObject.isActive=function(){
	return true;
}

module.exports=EvaluationObject;