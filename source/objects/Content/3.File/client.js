WAFile.contentUpdated=function(){

	this.updateIcon();
	
}

WAFile.justCreated=function(){
	if (!this.getAttribute('hasContent')) this.upload();
}


WAFile.openFile=function(){
	
	var type = this.getAttribute("mimeType");
	
	/*
	if(type.indexOf("pdf") > -1){
		
		return;
	}
	*/
	if(type.indexOf("image") > -1){
		this.openImage();
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
*	determine if the object's bounding box intersects with the square x,y,width,height
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
	
	if(this.getAttribute('mimeType').indexOf("image") == -1) return true;
	
	var rep = this.getRepresentation();
	
	//special case images: check if the selected part of the image only contains transparent/white pixels, then: skip this object
	
	//define the measures of the selected part of the image:
	var x;
	var y;
	var w;
	var h;
	
	if(ox < thisx){
		x = thisx;
	}
	else{
		x = ox;
	}
	
	if(oy < thisy){
		y = thisy;
	}
	else{
		y = oy;
	}
	
	if((ox+ow) < (thisx+thisw)){
		w = ox+ow;
	}
	else{
		w = thisx+thisw;
	}
	
	if((oy+oh) < (thisy+thish)){
		h = oy+oh;
	}
	else{
		h = thisy+thish;
	}
	
	//add header
	y = y + 33;
	h = h + 33; 
	
	for(var i = x; i < w; i++){
		for(var j = y; j < h; j++){
			if($(rep).find("image")[0].hasPixelAt(i, j)) return true;
		}
	}
	
	return false;
}