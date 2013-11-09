"use strict";

var theObject=Object.create(require('./common.js'));
var Modules=require('../../server.js');
module.exports=theObject;

theObject.onLeave=function(object,oldData,newData){
	//TODO: remove tag

	object.setAttribute("tunnel_inbox", false);

};

theObject.onEnter=function(object,oldData,newData){
	//TODO: push aside

	if(object.getAttribute("tunnel_inbox") == false){
		//TODO: show message - can't push message into inbox

		var y  = this.getAttribute('y');
		var x = this.getAttribute('x');
		var height = this.getAttribute('height');
		var width = this.getAttribute('width');

		var mean = 75;
		var standardDerivation = 30;

		var gaussianRnd = function () {
			return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
		}
		//bounce away...
		var rndY = y + height +Math.random()*standardDerivation + mean;
		var rndX = x + width + Math.random()*standardDerivation + mean;

		object.setAttribute("x", rndX);
		object.setAttribute("y", rndY);
	}



};

theObject.getPositioningDataFor = function(object){
	console.log("try to find position");

	//TODO: should only return not set position...

	object.setAttribute("x", this.getAttribute("x") + 30);
	object.setAttribute("y", this.getAttribute("y") + 30);

	var result = {
		"x" : this.getAttribute("x") + 30,
		"y" : this.getAttribute("y") + 30
	};

	return result;
}

theObject.decideIfActive = function(object){

	var att = object.getAttribute("tunnel_inbox");
	var source = this.getAttribute("source");

	var res =  att ===  source;
	return  res;
}

