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

Polygon.getPoints = function(){

	var rep = this.getRepresentation();

	var pointsString = $(rep).attr("points");	
	var pointsArr = pointsString.split(" ");
	
	var P = new Array();
	var x = parseInt($(rep).attr("x"));	
	var y = parseInt($(rep).attr("y"));	
	
	for(var i = 0; i< pointsArr.length; i++){
		var values = pointsArr[i].split(",");
		P[i] = {
			x : (parseInt(values[0])+x),
			y : (parseInt(values[1])+y)
		}
	}

	return P;
	
}

//calculate the Intersection point between a polygon object and a line (described by a1 and a2)
//this method will only return the first intersection point
Polygon.IntersectionObjectLine = function(a1, a2, p){
			
	var P = this.getPoints();
			
	for(var j = 0; j< P.length-1; j++){
		var Int = this.IntersectionLineLine(a1, a2, P[j], P[j+1]);
		if(typeof Int.x != 'undefined' && typeof Int.y != 'undefined'){

			var dx = P[j+1].x - P[j].x;
			var dy = P[j+1].y - P[j].y;
					
			var absval = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
			
			dy = dy/absval;
			dx = dx/absval;
			
			//you can define a padding if you need an intersection point which lies outside of the object (because of nicer graphical appearance)	
			Int.x = Int.x + (dy)*p;
			Int.y = Int.y + (-dx)*p;
			
			return Int;
		}
		if(Int == "coincident") return Int;
	}
	
	return "no intersection";
	
}
