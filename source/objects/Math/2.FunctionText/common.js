/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

var FunctionText=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

FunctionText.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
	this.registerAttribute('font-size',{type:'fontsize',min:10,standard:22,max:80,unit:'px',category:'Appearance'});
	this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance',checkFunction: function(object,value) {

		if (object.checkTransparency('font-color', value)) {
			return true;
		} else return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

	}});
	
	this.attributeManager.registerAttribute('width',{hidden:true});
	this.attributeManager.registerAttribute('height',{hidden:true});
	this.attributeManager.registerAttribute('fillcolor',{hidden:true});

    this.registerAttribute('rotation', {type:'number', category: 'Dimensions'});
	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);

	
}

FunctionText.execute=function(){
	
	this.editText();
	
}

FunctionText.isResizable=function(){
	return false;
}

FunctionText.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "FunctionText" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}

FunctionText.register('FunctionText');
FunctionText.isCreatable=true;

FunctionText.contentURLOnly = false; //content is only accessible via URL

FunctionText.content='Neuer Text';

FunctionText.moveByTransform = function(){return true;};

FunctionText.justCreated=function(){
	this.setContent(this.translate(this.currentLanguage, 'No text yet!'));
}

module.exports=FunctionText;