ImageObject.clientRegister=function(){
	
	   ImageObject.parent.clientRegister.call(this);
	
		this.registerAction(this.translate(this.currentLanguage, "Upload"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	},true, function() {
		return (ObjectManager.getSelected()[0].hasContent() === false);
	});
	
	this.registerAction(this.translate(this.currentLanguage, "Change"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.upload();
			
		}
		
	},true, function() {
		return (ObjectManager.getSelected()[0].hasContent() === true);
	});
	
	
	this.registerAction(this.translate(this.currentLanguage, "Download"),function(){
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			obj.downloadImage();
			
		}
		
	},true, function() {
		
		var selected = ObjectManager.getSelected();
		
		for (var i in selected) {
			var obj = selected[i];
			
			return (obj.hasContent() == true);
			
		}
		
	});

}

ImageObject.contentUpdated=function(){

	this.updateImage();
	
}

ImageObject.objectCreated=function(){
	this.upload();
}

ImageObject.upload = function() {
	GUI.uploadFile(this,this.translate(GUI.currentLanguage, "Please select an image"));
}


ImageObject.downloadImage=function(){
	
	window.open(this.getDownloadURL())

}


/**
*	determine if the image intersects with the square x,y,width,height
*/
ImageObject.objectIntersectsWith = function(ox,oy,ow,oh){
	
	//first check for bounding box intersection. If the bounding box does not 
	//intersect with the given coordinates, it is not even possible the image in general does
	
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
	
	
	var theImage=$(rep).find("image")[0];
	
	for(var i = x; i < w; i++){
		for(var j = y; j < h; j++){
			if(theImage.hasPixelAt(i, j)) return true;
		}
	}
	
	return false;
	
}