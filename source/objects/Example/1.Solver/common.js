/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

var Modules=require('../../../server.js')
var Solver=Object.create(Modules.ObjectManager.getPrototype('Rectangle'));

Solver.register=function(type){
	
	// Registering the object
	Modules.ObjectManager.getPrototype('Rectangle').register.call(this,type);
	
	this.registerAttribute('attribute',{type:'text',standard:'',category:'Selection'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Selection'});

}

Solver.onDrop=function(where){
	
	var calc = function (fn) {
	    return new Function('return ' + fn)();
	};
	
	if (where.type!='SimpleText') return;
	
	var text=where.getContentAsString();
	
	var result=calc(text);
	
	where.setContent(''+result);
}

Solver.isCreatable=true; 

module.exports=Solver;