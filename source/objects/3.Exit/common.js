/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

var Modules=require('../../server.js');

var Exit=Object.create(Modules.ObjectManager.getPrototype('IconObject'));

Exit.register=function(type){
	
	// Registering the object
	IconObject=Modules.ObjectManager.getPrototype('IconObject');
	IconObject.register.call(this,type);
	
	this.registerAttribute('destination',{type:'text',standard:'',category:'Functionality',changedFunction: function(object) { object.updateIcon(); }});
	this.registerAttribute('destinationObject',{type:'text',standard:'',category:'Functionality'});
	this.registerAttribute('filterObjects',{type:'boolean',standard:true,category:'Functionality'});

	this.registerAction('Follow',function(object){
		object.execute();
	},true);
	
	this.registerAction('Open in new window',function(object){	
		object.execute(true);
	},true);

	this.registerAction(this.translate(this.currentLanguage, "Open Object Selection"), function(object) { 
		object.showDialog(); 
	},true);

}

Exit.execute=function(openInNewWindow){

    var destination=this.getAttribute('destination');
	
	if (!destination) {
		return this.showDialog();
	} else {
		var self=this;

		var callback = false;
		if (self.getAttribute("destinationObject") !== '') {
			callback = function() {
				if (document.getElementById(self.getAttribute("destinationObject"))) {
					if (!GUI.couplingModeActive) {
						$(document).scrollTo(
							$('#'+self.getAttribute("destinationObject")), 
							1000, 
							{
								offset: {
									top: (self.getAttribute("height") / 2) - ($(window).height() / 2), 
									left: (self.getAttribute("width") / 2) - ($(window).width() / 2)
								} 
							}
						);
					}
				}
			}
		}

		if (openInNewWindow) {
			console.log("new window");
			window.open(destination);
		} else {
			console.log("follow");
			ObjectManager.loadRoom(destination, false, ObjectManager.getIndexOfObject(this.getAttribute('id')), callback);
		}

		//window.location.href = "/room/"+destination;
	}
}

Exit.register('Exit');
Exit.isCreatable=true;
Exit.moveByTransform = function(){return true;};

Exit.category = 'Rooms';

module.exports=Exit;