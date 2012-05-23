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
		$(rep).css("visibility", "hidden");
	} else {
		$(rep).css("visibility", "visible");
	}
	
}