WAFile.contentUpdated=function(){

	this.updateIcon();
	
}

WAFile.justCreated=function(){
	if (!this.getAttribute('hasContent')) this.upload();
}


WAFile.downloadFile=function(){

	window.open(this.getDownloadURL())

}


WAFile.openFile=function(){
	
	var type = this.getAttribute("mimeType");
	
	if(type.indexOf("image") > -1 || type.indexOf("text") > -1 || type.indexOf("pdf") > -1){
		this.buildContentDialog();
		return;
	}

	window.open(this.getContentURL(), "_blank");
	
}

WAFile.isPreviewable=function(){
	
	return GUI.mimeTypeIsPreviewable(this.getAttribute("mimeType"));
	
}

WAFile.upload = function() {
	GUI.uploadFile(this,this.translate(GUI.currentLanguage, "Please select a file"));
}

/**
*	determine if the icon of the file intersects with the square x,y,width,height
*/
WAFile.objectIntersectsWith = function(ox,oy,ow,oh){
	if (!this.isGraphical) return false;

	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();

	if (ox+ow<thisx) return false;
	if (ox>thisx+thisw) return false;
	if (oy+oh<thisy) return false;
	if (oy>thisy+thish) return false;
	
	return true;
	
}