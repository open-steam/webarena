/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/



SimpleKeyword.draw=function(external){
	
	var rep=this.getRepresentation();
	
	this.drawDimensions(external);

	//$(rep).attr("fill", this.getAttribute('fillcolor'));
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("text").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("text").attr("stroke-width", this.getAttribute('linesize'));
	}
	
	$(rep).find("text").attr("font-size", this.getAttribute('font-size'));
	$(rep).find("text").attr("font-family", this.getAttribute('font-family'));
	$(rep).find("text").attr("fill", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));
	
	$(rep).find("text").get(0).textContent=this.getAttribute('text');
	
	$(rep).find("text").attr("y", 0);
	$(rep).find("text").attr("y", rep.getBBox().y*(-1));

}