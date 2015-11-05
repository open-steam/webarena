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

WAFile.alwaysOnTop = true;
module.exports=WAFile;