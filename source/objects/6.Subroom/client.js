Subroom.filterObject = function(obj) {
	
}

Subroom.selectFile = function(id, name) {
	
}

Subroom.hasContent=function(){
	return true;
}

Subroom.deleteIt=function() {
	alert(this.translate(GUI.currentLanguage, "You deleted a subroom")
		+'\n'+this.translate(GUI.currentLanguage, "This operation only deletes the link,")
		+'\n'+this.translate(GUI.currentLanguage, "the objects contained are preserved")
		+'\n'+this.translate(GUI.currentLanguage, "They are still available in room")
		+' '+this.getAttribute('destination')+'.');
	this.remove();
}