/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Room=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Room.execute=function(){
	var destination=this.getAttribute('id');	
	ObjectManager.loadRoom(destination);
}

Room.register('Room');
Room.isCreatable=false;

Room.category = 'Rooms';

//returns the Evaluated position of an object. returns false if an object cannot be positioned
Room.getEvaluatedPositionFor=function(obj){
	
	// iterate over every evaluationObject
	
	var inventory=ObjectManager.getObjects();  // TODO this is not done corretly; only works client side with single rooms like this.
	
	var positives={};
	var negatives={};
	
	for (var i in inventory){
		var evaluationObject=inventory[i];
		if (!evaluationObject.isEvaluationObject) continue;
		var positive=evaluationObject.getPossiblePositionsFor(obj);
		var negative=evaluationObject.getForbiddenPositionsFor(obj);
		positives[i]=positive;
		negatives[i]=negative;
	}
	
	
	//TODO HERE... get possible positions!!!
	
	return false;
}

//evaluates the position for an object. If there was no evaluation, false is returned.
//if there was one, it returns an array of attributes which shall be set
Room.evaluatePositionFor=function(obj,x,y){
	
	var attributes={};
	
	// iterate over every evaluationObject
	
	var inventory=ObjectManager.getObjects();  // TODO this is not done corretly; only works client side with single rooms like this.
	
	var hasResult=false;
	
	for (var i in inventory){
		var evaluationObject=inventory[i];
		if (!evaluationObject.isEvaluationObject) continue;
		var result=evaluationObject.evaluatePosition(x,y);
		if (!result) continue;
		for (var key in result){
			var value=result[key];
			attributes[key]=value;
			hasResult=true;
		}
	}
	
	if (!hasResult) return false;
	
	return attributes;
}

module.exports=Room;