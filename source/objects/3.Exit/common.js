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

	var self=this;
	
	this.registerAction('Follow',function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var object = selected[i];
			
			object.execute();
			
		}
		
	},true);

}

Exit.execute=function(){
	
	var destination=this.getAttribute('destination');
	
	if (!destination) return;

	var self=this;

	var callback = false;
	if (self.getAttribute("destinationObject") !== '') {
		callback = function() {
			if (document.getElementById(self.getAttribute("destinationObject"))) {
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
	
	ObjectManager.loadRoom(destination,false,callback);
	
	//window.location.href = "/room/"+destination;
	
}

Exit.register('Exit');
Exit.isCreatable=true;
Exit.moveByTransform = function(){return true;};

Exit.category = 'Rooms';

module.exports=Exit;