/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


ImageObject.createRepresentation=function() {

	var rep = GUI.svg.group(this.getAttribute('id'));

	var rect = GUI.svg.rect(rep, 0,0,10,10);
	$(rect).attr("fill", "transparent");
	$(rect).addClass("borderRect");
	
	GUI.svg.image(rep, 0, 0, 100, 100, this.getPreviewContentURL());
	
	rep.dataObject=this;

	this.initGUI(rep);
	
	return rep;
	
}


ImageObject.draw = function(external) {
	
	GeneralObject.draw.call(this,external);
	
	var rep = this.getRepresentation();
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}
	
}


ImageObject.updateImage=function(){

	var rep=this.getRepresentation();

	if (this.hasContent() == false) {
		
		this.draw();
		
		$(rep).attr("href", "../../guis.common/images/imageNotFound.png");
		
		this.setViewWidth(128);
		this.setViewHeight(101);
		
	} else {
		
		this.draw();
	
		$(rep).attr("href", this.getPreviewContentURL());
	
	}

}


ImageObject.setViewWidth = function(value) {
	GeneralObject.setViewWidth.call(this, value);
	$(this.getRepresentation()).find("image").attr("width", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("width", parseInt(value));
}

ImageObject.setViewHeight = function(value) {
	GeneralObject.setViewWidth.call(this, value);
	$(this.getRepresentation()).find("image").attr("height", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("height", parseInt(value));
}
