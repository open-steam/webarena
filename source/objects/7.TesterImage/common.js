/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

var Modules=require('../../server.js')
var TesterImage=Object.create(Modules.ObjectManager.getPrototype('EvaluationObject'));

TesterImage.register=function(type){
	
	// Registering the object
	EvaluationObject=Modules.ObjectManager.getPrototype('EvaluationObject');
	EvaluationObject.register.call(this,type);
	

	this.registerAttribute('key',{type:'text',standard:'',category:'Keyword'});
	this.registerAttribute('value',{type:'text',standard:'',category:'Keyword'});
	
	this.registerAttribute('mimeType',{type:'text',standard:'image/png'});
	
	this.registerAttribute('shadow',{type:'boolean',standard:false,category:'Appearance'});

}

TesterImage.execute=ImageObject.execute
TesterImage.isProportional=ImageObject.isProportional
TesterImage.resizeProportional=ImageObject.resizeProportional
TesterImage.isResizable=ImageObject.isResizable

TesterImage.register('TesterImage');
TesterImage.isCreatable=true; 

module.exports=TesterImage;