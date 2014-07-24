/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js')
var Resetter=Object.create(Modules.ObjectManager.getPrototype('Ellipse'));

Resetter.category='Actor';

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
		if (object.type=='SimpleKeyword' && (object.getAttribute('x')<minX || object.getAttribute('x')>maxX || object.getAttribute('y')<minY || object.getAttribute('y')>maxY)){
			var x = Math.round(Math.random() * (maxX - minX)) + minX;
			var y = Math.round(Math.random() * (maxY - minY)) + minY;
			object.setAttribute('x',x);
			object.setAttribute('y',y);
		}
		if (object.type=='ActivatorHotspot'){
			var linkeds=object.getLinkedObjects();
			for (var i in linkeds){
				var linked=linkeds[i].object;
				linked.hide();
			}
		}
		if (object.type=='BlueActor'){
			object.setAttribute('x',10);
			object.setAttribute('y',100);
		}
		if (object.type=='OrangeActor'){
			object.setAttribute('x',60);
			object.setAttribute('y',100);
		}
	}
}

module.exports=Resetter;