/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var UnknownObject=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

UnknownObject.execute=function(){
	
}

UnknownObject.register('UnknownObject');
UnknownObject.isCreatable=false;

module.exports=UnknownObject;