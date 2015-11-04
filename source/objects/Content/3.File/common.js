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
		//if (object.getAttribute("preview")) return "icon size not changeable when preview is shown";
	}});

	this.registerAttribute('mimeType',{type:'text',standard:'text/plain',readonly:true});

	this.registerAttribute('fillcolor',{hidden: true});
	
	this.registerAttribute('opacity', {type: 'number', min: 10, max: 100, standard: 100, category: 'Appearance', stepsize: 10});
	
	/*
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
		
	}});
    */
	
     this.registerAttribute('width', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("height", object.getAttribute("height") * (value / object.getAttribute("width")));
            }

            return true;

        }, getFunction: function(object) {
            //var preview = object.getAttribute("preview");
            //if ((!preview)) {
            var bigIcon = object.getAttribute("bigIcon");
            if (bigIcon) {
                return "64"
            } else {
                return "32";
            }
            //}
            return object.get('width');
        }});

    this.registerAttribute('height', {type: 'number', min: 5, standard: 100, unit: 'px', category: 'Dimensions', checkFunction: function(object, value) {

            if (object.resizeProportional()) {
                object.setAttribute("width", object.getAttribute("width") * (value / object.getAttribute("height")));
            }

            return true;

        }, getFunction: function(object) {
            //var preview = object.getAttribute("preview");
            //if ((!preview)) {
            var bigIcon = object.getAttribute("bigIcon");
            if (bigIcon) {
                return "64"
            } else {
                return "32";
            }
            //}
            return object.get('height');
        }
        });
	
	this.registerAttribute('CloudConnection', {type:'list', hidden: true, standard: ["", "", "", ""]});
	
	this.registerAction('open File',function(){
	
		var selected = ObjectManager.getSelected();
		
		for (var i in selected){
			var obj = selected[i];
			obj.openFile();
		}
	});
	
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
			obj.removeContentDialog();
		}
		
	},true, function() {
		return (ObjectManager.getSelected()[0].hasContent() === true);
	});
	
	
	this.registerAction(this.translate(this.currentLanguage, "Download"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.downloadFile();
			
		}
		
	},true, function() {
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			return (obj.hasContent() == true);
			
		}
		
	});
	
	this.registerAction('Put back', function(lastClicked){
	
        var selected = ObjectManager.getSelected();
		for(var i = 0; i<selected.length; i++){
			var objectID = selected[i].id;
			var host = selected[i].getAttribute("CloudConnection")[0];
			var user = selected[i].getAttribute("CloudConnection")[1];
			var pw = selected[i].getAttribute("CloudConnection")[2];
			var path = selected[i].getAttribute("CloudConnection")[3];
			GUI.cloud.putBack(host, user, pw, path, objectID);
		}
		
	}, false, function(){
	
	   /* check if there is at least one selected object which cannot put back due to missing cloud information */
		var selected = ObjectManager.getSelected();
		for(var i = 0; i<selected.length; i++){
			if(selected[i].getAttribute("CloudConnection")[0] == ""){
				return false;
			}
		}
		return true;
		
	});
	
}

WAFile.execute=function(){

	if (this.hasContent() == true) {
		
		//if (this.getAttribute('preview')) return;
		
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
	//if (this.hasContent() == true && this.getAttribute("preview") == true) {
		//return GeneralObject.isResizable.call(this);
	//} else 
	return false; 
}

WAFile.register('File');
WAFile.isCreatable=true;

WAFile.moveByTransform = function(){return true;};

WAFile.alwaysOnTop = function () {
	//if (this.hasContent() == true && this.getAttribute("preview") == true) {
		//return false;
	//} else 
	return true;
};

module.exports=WAFile;