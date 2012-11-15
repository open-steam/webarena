/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js')
var TesterImage=Object.create(Modules.ObjectManager.getPrototype('ResponsiveObject'));

TesterImage.register=function(type){
	
	// Registering the object
	ActiveObject=Modules.ObjectManager.getPrototype('ResponsiveObject');
	File.register.call(this,type);
	

	this.registerAttribute('key',{type:'text',standard:'',category:'Keyword'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Keyword'});
	
	this.registerAttribute('mimeType',{type:'text',standard:'image/png'});
	
}

if (!File) var File=Modules.ObjectManager.getPrototype('File');

TesterImage.execute=function() {};
TesterImage.isProportional=File.isProportional;
TesterImage.resizeProportional=File.resizeProportional;
TesterImage.isResizable=File.isResizable;

TesterImage.register('TesterImage');
TesterImage.isCreatable=true; 
TesterImage.moveByTransform = function(){return true;};

module.exports=TesterImage;