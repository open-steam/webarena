/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var BidFile=Object.create(Modules.ObjectManager.getPrototype('File'));

BidFile.register=function(type){
	
	// Registering the object
	
	File=Modules.ObjectManager.getPrototype('File');
	File.register.call(this,type);
	

	
}


BidFile.register('BidFile');
BidFile.isCreatable=true;
BidFile.onMobile = false;

BidFile.moveByTransform = function(){return true;};

BidFile.category='Files';

module.exports=BidFile;