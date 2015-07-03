ImageObject.contentUpdated=function(){

	this.updateImage();
	
}

ImageObject.justCreated=function(){
	this.execute();
}

ImageObject.upload = function() {
	GUI.uploadFile(this,this.translate(GUI.currentLanguage, "Please select an image"));
}

ImageObject.downloadImage=function(){
	
	//TODO: direct download!!!
	window.open(this.getContentURL(), "_blank");
	
}

