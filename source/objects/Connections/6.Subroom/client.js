Subroom.clientRegister=function(){
	
	Subroom.parent.clientRegister.call(this);
	
		this.registerAction('Open destination', function(object) {
        object.follow(object.getAttribute("open in"));
    }, true);
}


Subroom.filterObject = function(obj) {
	
}

Subroom.selectFile = function(id, name) {
	
}

Subroom.hasContent=function(){
	return true;
}

Subroom.deleteIt=function() {
	var destination = this.getAttribute("destination");

	this.remove();
	
	if (destination !== undefined) {
		alert(this.translate(GUI.currentLanguage, "You deleted a subroom")
			+'\n'+this.translate(GUI.currentLanguage, "This operation only deletes the link,")
			+'\n'+this.translate(GUI.currentLanguage, "the objects contained are preserved")
			+'\n'+this.translate(GUI.currentLanguage, "They are still available in room")
			+' '+destination+'.');
	}
}

Subroom.follow=Gate.follow;