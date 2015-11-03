/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Triangle.draw=function(external){
	
	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this, external);

	$(rep).attr("fill",  this.getAttribute('fillcolor'));
	
	$(rep).css("opacity", (this.getAttribute('opacity')/100));
	
	if (!$(rep).hasClass("selected")) {
		var linecolor = this.getAttribute('linecolor');
		if(linecolor == "rgba(0, 0, 0, 0)"){
			$(rep).removeAttr("stroke");
			$(rep).removeAttr("stroke-width");
		}
		else{
			$(rep).attr("stroke", linecolor);
			$(rep).attr("stroke-width", this.getAttribute('linesize'));
		}
	}
	
	this.drawTriangle();
	
}


Triangle.drawTriangle = function() {
	var rep = this.getRepresentation();
	var edges = 3;
	var angle = 120;
	
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


Triangle.createRepresentation = function(parent) {
	
	this.points = [];
	var rep = GUI.svg.polygon(parent, [
    
    
    ]);

	rep.dataObject=this;
    $(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}

/* view getter */

Triangle.getViewBoundingBoxX = function() {
	return this.getViewX()-this.getViewWidth();
}

Triangle.getViewBoundingBoxY = function() {
	return this.getViewY()-this.getViewHeight();
}

Triangle.getViewBoundingBoxWidth = function() {
	if (this.hasAttribute('linesize')) {
		var linesize = this.getAttribute('linesize')/2;
	} else {
		var linesize = 0;
	}
	return this.getViewWidth()*2+linesize;
}

Triangle.getViewBoundingBoxHeight = function() {
	if (this.hasAttribute('linesize')) {
		var linesize = this.getAttribute('linesize')/2;
	} else {
		var linesize = 0;
	}
	return this.getViewHeight()*2+linesize;
}

/* view setter */

Triangle.setViewWidth = function(value) {
	$(this.getRepresentation()).attr("width", value);
	GUI.adjustContent(this);
	this.drawTriangle();
}

Triangle.setViewHeight = function(value) {
	$(this.getRepresentation()).attr("height", value);
	GUI.adjustContent(this);
	this.drawTriangle();
}

Triangle.getPoints = function(){

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

//calculate the Intersection point between a Triangle object and a line (described by a1 and a2)
//this method will only return the first intersection point
Triangle.IntersectionObjectLine = function(a1, a2){
			
	var P = this.getPoints();
			
	for(var j = 0; j< P.length-2; j++){
		var Int = this.IntersectionLineLine(a1, a2, P[j], P[j+1]);
		if(typeof Int.x != 'undefined' && typeof Int.y != 'undefined'){
			return Int;
		}
		if(Int == "coincident") return Int;
	}
	
	return "no intersection";
	
}
