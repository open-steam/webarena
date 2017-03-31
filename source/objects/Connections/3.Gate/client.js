Gate.clientRegister=function(){
	
	Gate.parent.clientRegister.call(this);
	
	this.registerAction('Follow',function(object){
		object.execute();
	},true);
}

/**
* creates a Dialogbox, display all subrooms in a list and set the destination
* self: the actual gate object this dialog is called for
*/
Gate.showLinklDialog = function(self) {
	
	Modules.Dispatcher.query('roomlist',undefined, function(rooms){
								var entries=[];
								for (var i in rooms){
									var room=rooms[i];
									entries[room.id]=room.name+' ('+room.id+')';
								}
								
								var dialogData={};
							    dialogData.heading=self.translate(GUI.currentLanguage, "select room");
							    dialogData.description=self.translate(GUI.currentLanguage, "please select a room");
							    dialogData.position={'x':self.getAttribute("x"),'y':self.getAttribute("y")};
							    dialogData.selectCallback=function(selection){
							    	self.saveDestination(selection);
							    }
							    dialogData.selectButtonText=self.translate(GUI.currentLanguage, "set target room");
							    dialogData.cancelButtonText=self.translate(GUI.currentLanguage, "cancel process");
							    dialogData.entries=entries;
							    dialogData.width=500;
							    
							    GUI.simpleSelectionDialog(dialogData);
							});
   
}
