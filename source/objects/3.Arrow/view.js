/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
	
Arrow.draw=function(external){

	Line.draw.call(this, external);

	var rep=this.getRepresentation();
	
	if (this.getAttribute("markerStart")) {
		var markerId = GUI.getSvgMarkerId("arrow", this.getAttribute("linecolor"), false);
		$(rep).find("line").attr("marker-start", "url(#"+markerId+")");
	} else {
		$(rep).find("line").attr("marker-start", "");
	}
	
	if (this.getAttribute("markerEnd")) {
		var markerId = GUI.getSvgMarkerId("arrow", this.getAttribute("linecolor"), true);
		$(rep).find("line").attr("marker-end", "url(#"+markerId+")");
	} else {
		$(rep).find("line").attr("marker-end", "");
	}


}


Arrow.createRepresentation = function() {

	var rep = Line.createRepresentation.call(this);

 	return rep;
	
}