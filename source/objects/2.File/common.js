/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var File=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

File.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('shadow',{type:'boolean',standard:false,category:'Appearance'});
	
	this.registerAttribute('mimeType',{type:'text',standard:'text/plain',readonly:true});

	this.registerAttribute('fillcolor',{hidden: true});

	this.registerAttribute('preview',{type:'boolean',standard:false,category:'Basic',changedFunction: function(object, value, local) {
		if (local) {
			object.updateThumbnail();
			GUI.deselectAllObjects();
			object.select(true);
		}
	}, checkFunction: function(object, value) {
		
		if (!value) return true; //turning preview off is always a good choice =)
		
		if (object.isPreviewable()) {
			return true;
		} else {
			return "this file is not previewable";
		}
		
	}});
	
	this.registerAction('Datei hochladen',function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.execute();
			
		}
		
	},true);
	
}

File.execute=function(){
	
	var that=this;
	
	if (this.hasContent() == true) {
		this.openFile();
	} else {
		GUI.uploadFile(this,this.translate(GUI.currentLanguage, "please select a file"));
	}

}

File.isProportional=function(){
	return true;
}

File.resizeProportional=function(){
	return true;
}

File.isResizable=function(){
	if (this.hasContent() == true && this.getAttribute("preview") == true) {
		return GeneralObject.isResizable.call(this);
	} else return false; 
}

File.register('File');
File.isCreatable=true;

File.moveByTransform = true;

File.category='Files';

module.exports=File;