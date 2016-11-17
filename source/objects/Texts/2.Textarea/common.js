/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../../server.js');

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
		
	this.standardData.fillcolor='rgba(0, 0, 0, 0)';
	this.standardData.linecolor='rgb(0,0,0)';
    this.standardData.width=250;
    this.standardData.height=100;
	
}

Textarea.execute=function(){

	//Intercepting the edit action execution to execute the 'DeviceDecisionInvocation' server call and device assessment.
	if(!this.inPlaceEditingMode){

		var selected = ObjectManager.getSelected();
		for (var i in selected) {
			var obj = selected[i];

			var name = "EditText";
			var sourceDeviceContexts = {
				roomID: this.getRoomID(),
				objectID: obj.id,
				action: "EditText"
			}

			var editObjectCallback = function() {
			}
			this.serverCall('DeviceDecisionInvocation',sourceDeviceContexts, editObjectCallback);

		}

	}
}

Textarea.intelligentRename=function(newValue){
	var objectName = this.getAttribute("name");
	var that = this;
	this.getContentAsString(function(oldValue){
		if ( newValue.length > 30 )
		{ newValue = newValue.substring(0, 30); }
	
		if ( objectName == "Textarea" || objectName == oldValue )
		{ that.setAttribute("name", newValue); }
	});
}

Textarea.register('Textarea');
Textarea.isCreatable=true;

Textarea.inPlaceEditingMode = false;

Textarea.contentURLOnly = false; //content is only accessible via URL

Textarea.content='Neuer Text';

module.exports=Textarea;