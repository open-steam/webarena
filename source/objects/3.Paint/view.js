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

Paint.createRepresentation = function(parent) {

	var rep=ImageObject.createRepresentation.call(this,parent);

	this.createCanvas();
	this.updateCanvas(this.getPreviewContentURL());
	
	return rep;

}

Paint.updateImage=ImageObject.updateImage;