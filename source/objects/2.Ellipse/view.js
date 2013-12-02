/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Ellipse.createRepresentation = function(parent) {
	var rep = GUI.svg.group(parent,this.getAttribute('id'));
	
	var ellipse = GUI.svg.ellipse(rep,
		10, //cx
		10, //cy
		10, //rx
		10 //ry
	);

	rep.dataObject=this;

	this.initGUI(rep);
	
	return rep;
	
}


Ellipse.draw=function(external){
	
	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this,external);

	$(rep).find("ellipse").attr("fill", this.getAttribute('fillcolor'));
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("ellipse").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("ellipse").attr("stroke-width", this.getAttribute('linesize'));
	}

}



Ellipse.updateInnerObject=function() {
	var rep=this.getRepresentation();
	
	var w = parseInt(this.getViewWidth()/2);
	var h = parseInt(this.getViewHeight()/2);
	
	if (isNaN(w)) {
		w = 0;
	}
	
	if (isNaN(h)) {
		h = 0;
	}

	$(rep).find("ellipse").attr("cx", w);
	$(rep).find("ellipse").attr("cy", h);
	
	$(rep).find("ellipse").attr("rx", w);
	$(rep).find("ellipse").attr("ry", h);
	
}


Ellipse.setViewWidth = function(value) {
	GeneralObject.setViewWidth.call(this,value);
	this.updateInnerObject();
}

Ellipse.setViewHeight = function(value) {
	GeneralObject.setViewHeight.call(this,value);
	this.updateInnerObject();
}
