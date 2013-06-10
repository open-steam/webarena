/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var SimpleText=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

SimpleText.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
	this.registerAttribute('font-size',{type:'fontsize',min:10,standard:22,max:80,unit:'px',category:'Appearance'});
	this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance',checkFunction: function(object,value) {

		if (object.checkTransparency('font-color', value)) {
			return true;
		} else return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

	}});;
	
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

SimpleText.execute=function(){
	
	this.editText();
	
}

SimpleText.isResizable=function(){
	return false;
}

SimpleText.register('SimpleText');
SimpleText.isCreatable=true;

SimpleText.contentURLOnly = false; //content is only accessible via URL

SimpleText.content='Neuer Text';

SimpleText.category='Texts';

SimpleText.moveByTransform = function(){return true;};

SimpleText.justCreated=function(){
	this.setContent(this.translate(this.currentLanguage, 'No text yet!'));
}

module.exports=SimpleText;