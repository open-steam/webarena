/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
	
Rectangle.draw=function(){

	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this);

	$(rep).attr("fill", this.getAttribute('fillcolor'));

	if (!$(rep).hasClass("selected")) {
		$(rep).attr("stroke", this.getAttribute('linecolor'));
		$(rep).attr("stroke-width", this.getAttribute('linesize'));
	}

}

Rectangle.getRepresentation=function(){

	var rep=document.getElementById(this.getAttribute('id'));

	if (!rep){
		
		return this.createRepresentation();
		
	}
	return rep;
}

Rectangle.createRepresentation = function() {

	rep = GUI.svg.rect(
		10, //x
		10, //y
		10, //width
		10 //height
	);

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}