/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Ellipse.createRepresentation = function() {
	
	var rep = GUI.svg.ellipse(
		10, //cx
		10, //cy
		10, //rx
		10 //ry
	);

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}


Ellipse.draw=function(external){
	
	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this,external);

	$(rep).attr("fill", this.getAttribute('fillcolor'));
	
	if (!$(rep).hasClass("selected")) {
		$(rep).attr("stroke", this.getAttribute('linecolor'));
		$(rep).attr("stroke-width", this.getAttribute('linesize'));
	}

}


/* view getter */

Ellipse.getViewX = function() {
	return parseInt($(this.getRepresentation()).attr("cx").toString(), 10);
}

Ellipse.getViewY = function() {
	return parseInt($(this.getRepresentation()).attr("cy").toString(), 10);
}

Ellipse.getViewWidth = function() {
	return parseInt($(this.getRepresentation()).attr("rx").toString(), 10);
}

Ellipse.getViewHeight = function() {
	return parseInt($(this.getRepresentation()).attr("ry").toString(), 10);
}

Ellipse.getViewBoundingBoxX = function() {
	return this.getViewX()-this.getViewWidth();
}

Ellipse.getViewBoundingBoxY = function() {
	return this.getViewY()-this.getViewHeight();
}

Ellipse.getViewBoundingBoxWidth = function() {
	if (this.hasAttribute('linesize')) {
		var linesize = this.getAttribute('linesize')/2;
	} else {
		var linesize = 0;
	}

	return this.getViewWidth()*2+linesize;
}

Ellipse.getViewBoundingBoxHeight = function() {
	if (this.hasAttribute('linesize')) {
		var linesize = this.getAttribute('linesize')/2;
	} else {
		var linesize = 0;
	}
	return this.getViewHeight()*2+linesize;
}

/* view setter */

Ellipse.setViewX = function(value) {
	$(this.getRepresentation()).attr("cx", parseInt(value));
	GUI.adjustContent(this);
}

Ellipse.setViewY = function(value) {
	$(this.getRepresentation()).attr("cy", parseInt(value));
	GUI.adjustContent(this);
}

Ellipse.setViewWidth = function(value) {
	$(this.getRepresentation()).attr("rx", parseInt(value));
	GUI.adjustContent(this);
}

Ellipse.setViewHeight = function(value) {
	$(this.getRepresentation()).attr("ry", parseInt(value));
	GUI.adjustContent(this);
}

Ellipse.setViewXYAnimated = function(x,y) {

	var self = this;
	
	var rep = this.getRepresentation();
	
	$(rep).animate({svgCx: x, svgCy: y}, 1000);
	
	GUI.adjustContent(this);
	
}