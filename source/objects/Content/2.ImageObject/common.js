/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var ImageObject=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

ImageObject.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('mimeType',{type:'text',standard:'image/png',readonly:true});

	this.registerAction(this.translate(this.currentLanguage, "Upload"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	},true, function() {
		return (ObjectManager.getSelected()[0].hasContent() === false);
	});
	
	this.registerAction(this.translate(this.currentLanguage, "Change"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	},true, function() {
		return (ObjectManager.getSelected()[0].hasContent() === true);
	});
	
	
	this.registerAction(this.translate(this.currentLanguage, "Download"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.downloadImage();
			
		}
		
	},true, function() {
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			return (obj.hasContent() == true);
			
		}
		
	});
	
}

ImageObject.execute=function(){
	
	this.downloadImage();

}

ImageObject.isProportional=function(){
	return true;
}

ImageObject.resizeProportional=function(){
	return true;
}

ImageObject.isResizable=function(){
	if (this.hasContent() == false) return false;
	return GeneralObject.isResizable.call(this);
}

ImageObject.register('ImageObject');
ImageObject.isCreatable=true;

ImageObject.moveByTransform = function(){return true;};

module.exports=ImageObject;