/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


Paint.draw=function(){

	var rep=this.getRepresentation();

	ImageObject.draw.call(this);

	if (!this.hasContent()) {
		//$(rep).css("visibility", "hidden");
	} else {
		//$(rep).css("visibility", "visible");
	}
	
}

Paint.createRepresentation = function() {

	ImageObject.createRepresentation.call(this);

	this.createCanvas();
	this.updateCanvas(this.getPreviewContentURL());
	
}

Paint.updateImage=function(){

	ImageObject.updateImage.call(this);

	if (this.hasContent() == false) {
		
		this.updateCanvas("../../guis.common/images/imageNotFound.png");
		
	} else {
		
		this.updateCanvas(this.getPreviewContentURL());
	
	}

}