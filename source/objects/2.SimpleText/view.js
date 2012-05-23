/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

SimpleText.draw=function(){
	
	var rep=this.getRepresentation();
	
	this.setViewX(this.getAttribute('x'));
	this.setViewY(this.getAttribute('y'));

	//$(rep).attr("fill", this.getAttribute('fillcolor'));
	
	if (!$(rep).hasClass("selected")) {
		$(rep).attr("stroke", this.getAttribute('linecolor'));
		$(rep).attr("stroke-width", this.getAttribute('linesize'));
	}
	
	$(rep).attr("font-size", this.getAttribute('font-size'));
	$(rep).attr("font-family", this.getAttribute('font-family'));
	$(rep).attr("fill", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));


	if (this.oldContent!=this.getContentAsString()) {   //content has changed
		rep.textContent = this.getContentAsString();
		if (!rep.textContent) rep.textContent='No text yet!';
	}
	
	this.oldContent=this.getContentAsString();

}



SimpleText.createRepresentation = function() {
	
	rep = GUI.svg.text(10, 10, "Text");

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}




SimpleText.editText = function() {
	
	GUI.editText(this);
	
}


