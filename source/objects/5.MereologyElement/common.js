/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var MereologyElement=Object.create(Modules.ObjectManager.getPrototype('EvaluationObject'));

MereologyElement.register=function(type){
	
	// Registering the object
	EvaluationObject=Modules.ObjectManager.getPrototype('EvaluationObject');
	EvaluationObject.register.call(this,type);
	

	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

MereologyElement.register('MereologyElement');
MereologyElement.isCreatable=true; 

MereologyElement.getPossiblePositionsFor=function(obj){
	
	var objValue=obj.getAttribute(this.getAttribute('attribute'));
	var refValue=this.getAttribute('value');
	
	console.log(objValue,refValue);
	
	if (objValue==refValue) {
		var result=[];
		
		console.log(this.getViewBoundingBoxX());
		console.log(this.getViewBoundingBoxY());
		
		console.log(this.getViewBoundingBoxWidth());
		console.log(this.getViewBoundingBoxHeight());
		
		return [];
		
		for (var i=0;i<this.getViewBoundingBoxWidth();i++){
			var x=this.getViewBoundingBoxX()+i;
			for (var j=0;j<this.getViewBoundingBoxHeight();j++){
				var y=this.getViewBoundingBoxY()+j;
				result.push({'x':x,'y':y});
			}
		};
		return result;
	}
	
	return [];
	
}

MereologyElement.getForbiddenPositionsFor=function(obj){
	
	return [];
	
}

MereologyElement.evaluatePosition=function(x,y){
	
	var attribute=this.getAttribute('attribute');
	var value=this.getAttribute('value');
	
	if (!attribute) return false;
	
	if (this.hasPixelAt(x,y)) {
		var result={};
		result[attribute]=value;
		return result;
	};
	
	return false;
}

MereologyElement.isActive=function(){
	return true;
}

module.exports=MereologyElement;