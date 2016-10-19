/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

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

	}});
	
	this.attributeManager.registerAttribute('width',{hidden:true});
	this.attributeManager.registerAttribute('height',{hidden:true});
	this.attributeManager.registerAttribute('fillcolor',{hidden:true});

    this.registerAttribute('rotation', {type:'number', category: 'Dimensions'});
	
	this.registerAttribute('blockedByUser', {type:'text',readonly: false, standard: "none", hidden:true});
	this.registerAttribute('blockedByID', {type:'text',readonly: false, standard: "none", hidden:true});
	this.registerAttribute('tryUnblock', {type:'number',readonly: false, standard: 0, hidden:true});
	
}

SimpleText.execute=function(){
		// if you enter the Editmode then block the object
		if (this.checkBlock()){
			this.editText();
		}
}

SimpleText.isResizable=function(){
	return false;
}

SimpleText.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "SimpleText" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}

SimpleText.register('SimpleText');
SimpleText.isCreatable=true;
SimpleText.inPlaceEditingMode = false;
SimpleText.BlockingUser = null;

SimpleText.contentURLOnly = false; //content is only accessible via URL

SimpleText.content='Neuer Text';

module.exports=SimpleText;