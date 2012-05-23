/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


ImageObject.createRepresentation = function() {

	rep = GUI.svg.image(10, 10, 10, 10, this.getPreviewContentURL());
	
	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}


ImageObject.updateImage=function(){

	var rep=this.getRepresentation();

	if (this.hasContent() == false) {
		
		GeneralObject.draw.call(this);
		
		$(rep).attr("href", "../../guis.common/images/imageNotFound.png");
		
		this.setViewWidth(128);
		this.setViewHeight(101);
		
	} else {
		
		GeneralObject.draw.call(this);
	
		$(rep).attr("href", this.getPreviewContentURL());
	
	}

}
