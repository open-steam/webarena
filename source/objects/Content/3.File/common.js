/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var WAFile=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

WAFile.register=function(type){
	
	// Registering the object
	
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	this.registerAttribute('bigIcon',{type:'boolean',standard:true,changedFunction: function(object) { 
		object.updateIcon(); 
	}, checkFunction: function(object, value) {
		if (object.getAttribute("preview")) return "icon size not changeable when preview is shown";
	}, mobile: false});

	this.registerAttribute('mimeType',{type:'text',standard:'text/plain',readonly:true});

	this.registerAttribute('fillcolor',{hidden: true});
	this.registerAttribute('width',{hidden: true});
	this.registerAttribute('height',{hidden: true});
	

	this.registerAttribute('preview',{type:'boolean',standard:false,category:'Basic',changedFunction: function(object, value, local) {
		if (local) {
			object.updateIcon();
			GUI.updateLayers();
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
		
	}, mobile: false});
	
	this.registerAttribute('onMobile', {type:'boolean', standard:false, category:'Basic', mobile: false});
	
	this.registerAction('to front',function(){
	
		/* set a very high layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			
			obj.setAttribute("layer", obj.getAttribute("layer")+999999);
			
		}
		
		ObjectManager.renumberLayers();
		
	}, false);
	
	this.registerAction('to back',function(){
		
		/* set a very low layer for all selected objects (keeping their order) */
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			
			obj.setAttribute("layer", obj.getAttribute("layer")-999999);
			
		}
		
		ObjectManager.renumberLayers();
		
	}, false);

	this.registerAction(this.translate(this.currentLanguage, "Upload file"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	},true, function() {
		return (ObjectManager.getSelected()[0].hasContent() === false);
	});
	
	this.registerAction(this.translate(this.currentLanguage, "Change content"),function(){
		
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
			
			obj.openFile();
			
		}
		
	},true, function() {
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			return (obj.hasContent() == true);
			
		}
		
	});
	
}

WAFile.execute=function(){

	if (this.hasContent() == true) {
		
		if (this.getAttribute('preview')) return;
		
		this.openFile();
		
	} else {
		this.upload();
	}

}

WAFile.isProportional=function(){
	return true;
}

WAFile.resizeProportional=function(){
	return true;
}

WAFile.isResizable=function(){
	if (this.hasContent() == true && this.getAttribute("preview") == true) {
		return GeneralObject.isResizable.call(this);
	} else return false; 
}

WAFile.register('File');
WAFile.isCreatable=true;
WAFile.isCreatableOnMobile = true;
WAFile.onMobile = true;

WAFile.moveByTransform = function(){return true;};

WAFile.alwaysOnTop = function () {
	if (this.hasContent() == true && this.getAttribute("preview") == true) {
		return false;
	} else return true;
};

module.exports=WAFile;
