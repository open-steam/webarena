/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Textarea=Object.create(Modules.ObjectManager.getPrototype('GeneralObject'));

Textarea.register=function(type){
	
	// Registering the object
	
	GeneralObject=Modules.ObjectManager.getPrototype('GeneralObject');
	GeneralObject.register.call(this,type);
	
	this.registerAttribute('font-family',{type:'font',standard:'Arial',category:'Appearance'});
	this.registerAttribute('font-size',{type:'fontsize',min:10,standard:14,max:80,unit:'px',category:'Appearance'});
	this.registerAttribute('font-color',{type:'color',standard:'black',category:'Appearance',checkFunction: function(object,value) {

		if (object.checkTransparency('font-color', value)) {
			return true;
		} else return object.translate(GUI.currentLanguage, "Completely transparent objects are not allowed.");

	}});;
	
	this.standardData.fillcolor='rgb(255,255,255)';
	this.standardData.linecolor='rgb(0,0,0)';
    this.standardData.width=250;
    this.standardData.height=100;

	
	this.registerAction('Edit',function(){
		$.each(ObjectManager.getSelected(), function(key, object) {
			object.execute();
		});
	}, true);
	
}

Textarea.execute=function(){
	
	this.editText();
	
}

Textarea.register('Textarea');
Textarea.isCreatable=true;

Textarea.contentURLOnly = false; //content is only accessible via URL

Textarea.content='Neuer Text';

Textarea.category='Texts';

module.exports=Textarea;