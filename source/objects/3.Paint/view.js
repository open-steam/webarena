/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


Paint.draw=function(external){

	var rep=this.getRepresentation();

	ImageObject.draw.call(this,external);
/*
	if (!this.hasContent()) {
		$(rep).css("display", "none");
	} else {
		$(rep).css("display", "");
	}
	*/
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