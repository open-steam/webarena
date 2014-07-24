/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Polygon.draw=function(external){
	
	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this, external);

	$(rep).attr("fill",  this.getAttribute('fillcolor'));

	
	if (!$(rep).hasClass("selected")) {
		$(rep).attr("stroke", this.getAttribute('linecolor'));
		$(rep).attr("stroke-width", this.getAttribute('linesize'));
	}
	
	this.drawPolygon();
	
}


Polygon.drawPolygon = function() {
	var rep=this.getRepresentation();
	var edges = this.getAttribute("edges");
	var angle = 360/edges;
	
	this.points = [];
	var pointsString = "";
	
	var width = this.getAttribute("width");
	var height = this.getAttribute("height");
	
	var rotation = this.getAttribute("rotation")/180*Math.PI;
	
	var firstPoints = undefined;
	
	for (var i=0; i < edges; i++) {
		
		var x = width*Math.cos(2*Math.PI*(i/edges)+rotation);
		var y = height*Math.sin(2*Math.PI*(i/edges)+rotation);
		
		this.points.push([x,y]);
		pointsString += x+","+y+" ";
		
		if (firstPoints == undefined) {
			firstPoints = pointsString;
		}
		
	}
	
	/* set last point (this is the first point, but without this a border would end at the point next to the last one) */
	pointsString = pointsString+firstPoints;
	
	$(rep).attr("points", pointsString);

}


Polygon.createRepresentation = function(parent) {
	
	this.points = [];
	var rep = GUI.svg.polygon(parent, this.points);

	rep.dataObject=this;
    $(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}

/* view getter */

Polygon.getViewBoundingBoxX = function() {
	return this.getViewX()-this.getViewWidth();
}

Polygon.getViewBoundingBoxY = function() {
	return this.getViewY()-this.getViewHeight();
}

Polygon.getViewBoundingBoxWidth = function() {
	if (this.hasAttribute('linesize')) {
		var linesize = this.getAttribute('linesize')/2;
	} else {
		var linesize = 0;
	}
	return this.getViewWidth()*2+linesize;
}

Polygon.getViewBoundingBoxHeight = function() {
	if (this.hasAttribute('linesize')) {
		var linesize = this.getAttribute('linesize')/2;
	} else {
		var linesize = 0;
	}
	return this.getViewHeight()*2+linesize;
}

/* view setter */

Polygon.setViewWidth = function(value) {
	$(this.getRepresentation()).attr("width", value);
	GUI.adjustContent(this);
	this.drawPolygon();
}

Polygon.setViewHeight = function(value) {
	$(this.getRepresentation()).attr("height", value);
	GUI.adjustContent(this);
	this.drawPolygon();
}

//calculate the Intersection point between a polygon object and a line (which ends in the middle of the polygon, described by a1 and a2)
Polygon.IntersectionObjectLine = function(a1, a2){
				
	//calculate the corner points to build the bounding box lines:
	var padding1 = 10;
	var padding2 = 30;
			
	var CenterLeft = new Object();
	CenterLeft.x = this.getViewBoundingBoxX()-padding2;
	CenterLeft.y = this.getViewBoundingBoxY()+(this.getViewBoundingBoxHeight()/2);
		
	var CenterRight = new Object();
	CenterRight.x = this.getViewBoundingBoxX()+this.getViewBoundingBoxWidth()+padding2;
	CenterRight.y = this.getViewBoundingBoxY()+(this.getViewBoundingBoxHeight()/2);
		
	var LeftTop = new Object();
	LeftTop.x = this.getViewBoundingBoxX()+(this.getViewBoundingBoxWidth()/4)-padding1;
	LeftTop.y = this.getViewBoundingBoxY()-padding1;
		
	var LeftBottom = new Object();
	LeftBottom.x = this.getViewBoundingBoxX()+(this.getViewBoundingBoxWidth()/4)-padding1;
	LeftBottom.y = this.getViewBoundingBoxY()+this.getViewBoundingBoxHeight()+padding1;
		
	var RightBottom = new Object();
	RightBottom.x = this.getViewBoundingBoxX()+(this.getViewBoundingBoxWidth()*0.75)+padding1;
	RightBottom.y = this.getViewBoundingBoxY()+this.getViewBoundingBoxHeight()+padding1;
		
	var RightTop = new Object();
	RightTop.x = this.getViewBoundingBoxX()+(this.getViewBoundingBoxWidth()*0.75)+padding1;
	RightTop.y = this.getViewBoundingBoxY()-padding1;
		
	//calculate the Intersection Points between the line and each bounding box line	
	var Intersection1 = this.IntersectionLineLine(a1, a2, CenterLeft, LeftBottom);
	var Intersection2 = this.IntersectionLineLine(a1, a2, LeftBottom, RightBottom);
	var Intersection3 = this.IntersectionLineLine(a1, a2, RightBottom, CenterRight);
	var Intersection4 = this.IntersectionLineLine(a1, a2, CenterRight, RightTop);
	var Intersection5 = this.IntersectionLineLine(a1, a2, RightTop, LeftTop);
	var Intersection6 = this.IntersectionLineLine(a1, a2, LeftTop, CenterLeft);
		
	if(typeof Intersection1.x != 'undefined' && typeof Intersection1.y != 'undefined'){ //Intersection left bottom
		return Intersection1;
	}
	if(typeof Intersection2.x != 'undefined' && typeof Intersection2.y != 'undefined'){ //Intersection bottom
		return Intersection2;
	}
	if(typeof Intersection3.x != 'undefined' && typeof Intersection3.y != 'undefined'){ //Intersection right bottom
		return Intersection3;
	}
	if(typeof Intersection4.x != 'undefined' && typeof Intersection4.y != 'undefined'){ //Intersection right top
		return Intersection4;
	}
	if(typeof Intersection5.x != 'undefined' && typeof Intersection5.y != 'undefined'){ //Intersection on top
		return Intersection5;
	}
	if(typeof Intersection6.x != 'undefined' && typeof Intersection6.y != 'undefined'){ //Intersection left top
		return Intersection6;
	}		
}
