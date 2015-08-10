/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


ImageObject.createRepresentation=function(parent) {

	var rep = GUI.svg.group(parent,this.getAttribute('id'));

	var rect = GUI.svg.rect(rep, 0,0,10,10);
	$(rect).attr("fill", "transparent");
	$(rect).addClass("borderRect");
	
	var SVGImage=GUI.svg.image(rep, 0, 0, 100, 100, this.getIconPath()+"/image");
	
	this.createPixelMap(SVGImage);
	
	this.updateImage();
	
	rep.dataObject=this;

	this.initGUI(rep);
	
	return rep;
	
}


ImageObject.createPixelMap=function(SVGImage){
	
	if (!SVGImage) SVGImage=$(this.getRepresentation()).find("image")[0];
	
	var image = new Image();
	
	image.src=$(SVGImage).attr("href");
	
	var self=this;
	
	image.onload=function(){
		var bbox=SVGImage.getBoundingClientRect();
		var newCanvas = document.createElement('canvas');
		
		var width=0;
		var height=0;
		
		if (image.width>image.height){
			width=bbox.width;
			height=bbox.width*(image.height/image.width);
		} else {
			height=bbox.height;
			width=bbox.height*(image.width/image.height);
		}
		
		newCanvas.height=bbox.height;
		newCanvas.width=bbox.width;
		window.test=image;
		var ctx = newCanvas.getContext('2d');
		ctx.drawImage(image, (bbox.width-width)/2, (bbox.height-height)/2, width, height);
		//document.body.appendChild(newCanvas);
		
		SVGImage.hasPixelAtMousePosition=function(mouseX,mouseY){
			
			var bbox=SVGImage.getBoundingClientRect();
			
			var x=mouseX-bbox.left;
			var y=mouseY-bbox.top;
			var isThere=false;
			
			if (x<0) return false;
			if (y<0) return false;
			if (x>bbox.width) return false;
			if (y>bbox.height) return false;
			
			var imgd = ctx.getImageData(x-5, y-5, 10, 10);
			var pix = imgd.data;
			
			for (var i = 0, n = pix.length; i < n; i += 4) {
			    if(pix[i+3]) isThere=true;
			}
			
			return(isThere);
		}
		
		SVGImage.hasPixelAt=function(absX,absY){
			
			var bbox=SVGImage.getBoundingClientRect();
			
			var x=absX-bbox.left;
			var y=absY-bbox.top;
			var isThere=false;
			
			if (x<0) return false;
			if (y<0) return false;
			if (x>bbox.width) return false;
			if (y>bbox.height) return false;
			
			var imgd = ctx.getImageData(x, y, 1, 1);
			var pix = imgd.data;
			
			var sum = pix[0] + pix[1] + pix[2] + pix[3];
			
			//transparent pixel: 0, 0, 0, 0 (sum 0)
			//white pixel: 255, 255, 255, 255 (sum 1020)
			if(sum != 0 && sum != 1020) isThere=true;
			
			return(isThere);
		}
		
	}
	
}


ImageObject.draw = function(external) {
	
	GeneralObject.draw.call(this,external);
	
	var rep = this.getRepresentation();
	
	if (!$(rep).hasClass("selected")) {		
		var linecolor = this.getAttribute('linecolor');
		if(linecolor == "rgba(0, 0, 0, 0)"){
			$(rep).find("rect").removeAttr("stroke");
			$(rep).find("rect").removeAttr("stroke-width");
		}
		else{
			$(rep).find("rect").attr("stroke", linecolor);
			$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
		}
	}
	
	this.createPixelMap();
	
}


ImageObject.updateImage=function(){

	var rep=this.getRepresentation();

	if (this.hasContent() == false) {
	
		this.draw();
		
		$(rep).find("image").attr("href", "../../guis.common/images/imageNotFound.png");
		//$(rep).find("image").attr("href", this.getIconPath()+".png");
		
		this.setViewWidth(128);
		this.setViewHeight(101);
		
	} else {
	
		$(rep).find("image").attr("href", this.getPreviewContentURL());
		
		var self=this;
		
		$(rep).find("image").bind("load",function(){
			self.draw();
		});
		
		this.draw();
	
	}

}


ImageObject.setViewWidth = function(value) {
	GeneralObject.setViewWidth.call(this, value);
	$(this.getRepresentation()).find("image").attr("width", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("width", parseInt(value));
}


ImageObject.setViewHeight = function(value) {
	GeneralObject.setViewHeight.call(this, value);
	$(this.getRepresentation()).find("image").attr("height", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("height", parseInt(value));
}