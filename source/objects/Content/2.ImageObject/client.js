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


/**
*	determine if the image intersects with the square x,y,width,height
*/
ImageObject.objectIntersectsWith = function(ox,oy,ow,oh){
	
	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();

	if (ox+ow<thisx) return false;
	if (ox>thisx+thisw) return false;
	if (oy+oh<thisy) return false;
	if (oy>thisy+thish) return false;
	
	//special case images: check if the selected part of the image only contains transparent/white pixels, then: skip this object
	
	var rep = this.getRepresentation();
	
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