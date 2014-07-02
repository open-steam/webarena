WAFile.contentUpdated=function(){

	this.updateIcon();
	
}

WAFile.justCreated=function(){
	if (!this.getAttribute('hasContent')) this.upload();
}


WAFile.openFile=function(){
	
	window.open(this.getContentURL(), "_blank");
	
}

WAFile.isPreviewable=function(){
	
	return GUI.mimeTypeIsPreviewable(this.getAttribute("mimeType"));
	
}

WAFile.upload = function() {
	GUI.uploadFile(this,this.translate(GUI.currentLanguage, "Please select a file"));
}