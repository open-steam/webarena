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
		var linecolor = this.getAttribute('linecolor');
		if(linecolor == "transparent" || linecolor == "rgba(0, 0, 0, 0)"){
			$(rep).find("ellipse").removeAttr("stroke");
			$(rep).find("ellipse").removeAttr("stroke-width");
		}
		else{
			$(rep).find("ellipse").attr("stroke", linecolor);
			$(rep).find("ellipse").attr("stroke-width", this.getAttribute('linesize'));
		}
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

//calculate the Intersection point between an ellipse object and a line (which ends in the middle of the ellipse, described by a1 and a2)
Ellipse.IntersectionObjectLine = function(a1, a2){

	var rep = this.getRepresentation();
	
	var rx = parseFloat($(rep).find("ellipse").attr("rx"));
	var ry = parseFloat($(rep).find("ellipse").attr("ry"));
		
	var P;
		
	if(a1.x == (this.getViewBoundingBoxX()+(this.getViewBoundingBoxWidth()/2)) && a1.y == (this.getViewBoundingBoxY()+(this.getViewBoundingBoxHeight()/2))){ //a1 is center of ellipse
		P = this.IntersectionLineEllipse(rx, ry, a1, a2);
			
		P.x = P.x + a1.x;
		P.y = P.y + a1.y;
	}
	else{ //a2 is center of ellipse
		P = this.IntersectionLineEllipse(rx, ry, a2, a1);
			
		P.x = P.x + a2.x;
		P.y = P.y + a2.y;
	}
			
	return P;
	
}

//calculate the Intersection point between an ellipse (described by rx, ry and a1) and a line (which ends in the middle of the ellipse, described by a1 and a2)
Ellipse.IntersectionLineEllipse = function(rx, ry, a1, a2){

	//a1 is center of ellipse
	
	var dy = a2.y-a1.y;
	var dx = a2.x-a1.x;
		
	var phi = Math.atan(dy/dx);

	var t = Math.atan((rx*Math.tan(phi))/ry)	
	
	if(dx<0 && dy<0) t=t-Math.PI;
	
	if(dx<0 && dy>0) t=t+Math.PI;
				  		
	var P = new Object();
	P.x = rx * Math.cos(t);
	P.y = ry * Math.sin(t);
				
	if(dy==0 && dx<0){ //special case (because t can be null on the left side and on the right side of the ellipse) 
		P.x = P.x-2*rx;
	}	
				
	return P;

}
