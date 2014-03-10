File.contentUpdated=function(){

	this.updateIcon();
	
}

File.justCreated=function(){
	if (!this.getAttribute('hasContent')) this.upload();
}


File.openFile=function(){
	
	window.open(this.getContentURL(), "_blank");
	
}

File.isPreviewable=function(){
	
	return GUI.mimeTypeIsPreviewable(this.getAttribute("mimeType"));
	
}

File.upload = function() {
	GUI.uploadFile(this,this.translate(GUI.currentLanguage, "Please select a file"));
}