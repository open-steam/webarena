/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js')
var Resetter=Object.create(Modules.ObjectManager.getPrototype('Ellipse'));

Resetter.category = 'Evaluations';

Resetter.resizeProportional=function(){
	return true;
}

Resetter.execute=function(){
	var objects=Modules.ObjectManager.getInventory();
	
	var minX=20;
	var minY=20;
	var maxX=600;
	var maxY=400;
	
	for (var i in objects){
		var object=objects[i];
		if (object.type=='SimpleKeyword'){
			//console.log(object.toString());
			var x = Math.round(Math.random() * (maxX - minX)) + minX;
			var y = Math.round(Math.random() * (maxY - minY)) + minY;
			object.setAttribute('x',x);
			object.setAttribute('y',y);
		}
	}
}

module.exports=Resetter;