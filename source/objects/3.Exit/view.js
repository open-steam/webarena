/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


Exit.createRepresentation = function() {
	
	rep = GUI.svg.group(this.getAttribute('id'));
	
	GUI.svg.image(rep, 0, 0, 32, 32, this.getIconPath());
	
	var text = GUI.svg.text(rep, 0, 44, "Text");
	$(text).attr("font-size", 12);

	rep.dataObject=this;

	this.initGUI(rep);
	
	return rep;
	
}


Exit.draw=function(){
	
	var rep=this.getRepresentation();

	this.setViewX(this.getAttribute('x'));
	this.setViewY(this.getAttribute('y'));
	
	$(rep).attr("layer", this.getAttribute('layer'));
	
	$(rep).find("text").get(0).textContent = this.getAttribute('name');
	
}




