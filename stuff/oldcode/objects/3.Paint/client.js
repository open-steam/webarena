Paint.execute=function(){

	alert('Zeichnungen können nicht mehr bearbeitet werden!');
	
}


Paint.boxIntersectsWith=function(otherx,othery,otherwidth,otherheight){
	
	if (otherwidth <= 0) otherwidth = 1;
	if (otherheight <= 0) otherheight = 1;
	
	if (!GeneralObject.boxIntersectsWith.call(this, otherx, othery, otherwidth, otherheight)) {
		return false;
	}
	return true; //TODO: fix this...
	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();
	
	var x = otherx-thisx;
	var y = othery-thisy;
	
	var width = otherwidth;
	var height = otherheight;
	
	if (x+width > thisw) {
		width = thisw-x;
	}
	
	if (y+height > thish) {
		height = thish-y;
	}
	
	var canvasContext = this.canvas.getContext('2d');

	var pixelData = canvasContext.getImageData(x, y, width, height);

	var i = 0;
	while (i < pixelData.width*pixelData.height) {
		
		var a = pixelData.data[i+3];
		
		if (a > 0) return true; //pixel found
		
		i = i+4;
	}
	
	return false;
	
}

Paint.createCanvas=function() {

	this.canvas = document.createElement("canvas");
	
}

Paint.updateCanvas=function(imageURL) {
	var self = this;
	
	var img = new Image();
	
	$(img).bind("load", function() {

		$(self.canvas).attr("width", img.width);
		$(self.canvas).attr("height", img.height);
		
		var canvasContext = self.canvas.getContext('2d');

		canvasContext.drawImage(img, 0, 0, img.width, img.height);
		
	});
	
	$(img).attr("src", imageURL);
	
}