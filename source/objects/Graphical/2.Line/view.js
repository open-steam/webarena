/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
	
Line.draw=function(external){

	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this, external);

	if (!$(rep).hasClass("selected")) {
		$(rep).children("line").attr("stroke", this.getAttribute('linecolor'));
	}
	
	$(rep).css("opacity", (this.getAttribute('opacity')/100));
	
	$(rep).children("line").attr("stroke-width", this.getAttribute('linesize'));
	
	switch (this.getAttribute('linestyle')){
		case 'dotted':var dasharray='5,5';break;
		case 'dashed':var dasharray='10,5';break;
		default:var dasharray='1,0';break;
	}
	$(rep).children("line").attr("stroke-dasharray", dasharray);

	if (this.getAttribute("direction") == 1) {
		$(rep).children("line").attr("x1", 0);
		$(rep).children("line").attr("y1", 0);
		$(rep).children("line").attr("x2", this.getViewWidth());
		$(rep).children("line").attr("y2", this.getViewHeight());
	} else if (this.getAttribute("direction") == 2) {
		$(rep).children("line").attr("x1", this.getViewWidth());
		$(rep).children("line").attr("y1", 0);
		$(rep).children("line").attr("x2", 0);
		$(rep).children("line").attr("y2", this.getViewHeight());		
	} else if (this.getAttribute("direction") == 3) {
		$(rep).children("line").attr("x1", this.getViewWidth());
		$(rep).children("line").attr("y1", this.getViewHeight());
		$(rep).children("line").attr("x2", 0);
		$(rep).children("line").attr("y2", 0);		
	} else {
		$(rep).children("line").attr("x1", 0);
		$(rep).children("line").attr("y1", this.getViewHeight());
		$(rep).children("line").attr("x2", this.getViewWidth());
		$(rep).children("line").attr("y2", 0);
	}
	
	$(rep).children("line.clickTarget").attr("stroke-width", 20);
	$(rep).children("line.clickTarget").attr("stroke", 'rgba(255,255,255,0)');

}


Line.createRepresentation = function(parent) {

	var rep = GUI.svg.group(parent,this.getAttribute('id'));

	var selectLine=GUI.svg.line(rep, 0, 0, 20, 20, {});
 	var line=GUI.svg.line(rep, 0, 0, 20, 20, {});

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));
	$(line).addClass("borderRect");
	$(selectLine).addClass("clickTarget");

	this.initGUI(rep);
	
	return rep;
	
}


Line.determineDirection = function(widthChanged, heightChanged) {

	if (this.getAttribute("direction") == 1) {
		
		if (widthChanged && heightChanged) {
			var direction = 3;
		} else if (widthChanged) {
			var direction = 2;
		} else if (heightChanged) {
			var direction = 4;
		}
		
	} else if (this.getAttribute("direction") == 2) {

		if (widthChanged && heightChanged) {
			var direction = 4;
		} else if (widthChanged) {
			var direction = 1;
		} else if (heightChanged) {
			var direction = 3;
		}

	} else if (this.getAttribute("direction") == 3) {

		if (widthChanged && heightChanged) {
			var direction = 1;
		} else if (widthChanged) {
			var direction = 4;
		} else if (heightChanged) {
			var direction = 2;
		}

	} else if (this.getAttribute("direction") == 4) {

		if (widthChanged && heightChanged) {
			var direction = 2;
		} else if (widthChanged) {
			var direction = 3;
		} else if (heightChanged) {
			var direction = 1;
		}

	}
	
	if (direction !== undefined) {
		this.setAttribute("direction", direction);
	}
	
}


Line.resizeHandler = function() {
	var self = this;

	self.determineDirection(self.getViewWidth() < 0, self.getViewHeight() < 0);
	
	if (self.getViewHeight() < 0) {
		self.setViewY(self.getViewY()+self.getViewHeight());
		self.setViewHeight(Math.abs(self.getViewHeight()));
	}
	
	if (self.getViewWidth() < 0) {
		self.setViewX(self.getViewX()+self.getViewWidth());
		self.setViewWidth(Math.abs(self.getViewWidth()));
	}
	
	self.removeControls();
	self.addControls();
	
	GeneralObject.resizeHandler.call(this);
	
	self.draw();
	
}



Line.setViewWidth = function(value) {
	
	var rep = this.getRepresentation();
	
	if (this.getAttribute("direction") == 1) {
		$(rep).children("line").attr("x2", value);
	} else if (this.getAttribute("direction") == 2) {
		$(rep).children("line").attr("x1", value);
	} else if (this.getAttribute("direction") == 3) {
		$(rep).children("line").attr("x1", value);
	} else {
		$(rep).children("line").attr("x2", value);
	}
	
	$(rep).attr("width", value);
	
	GUI.adjustContent(this);
}

Line.setViewHeight = function(value) {
	
	var rep = this.getRepresentation();
	
	if (this.getAttribute("direction") == 1) {
		$(rep).children("line").attr("y2", value);
	} else if (this.getAttribute("direction") == 2) {
		$(rep).children("line").attr("y2", value);
	} else if (this.getAttribute("direction") == 3) {
		$(rep).children("line").attr("y1", value);
	} else {
		$(rep).children("line").attr("y1", value);
	}
	
	$(rep).attr("height", value);
	
	GUI.adjustContent(this);
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
Line.checkTransparency = function(attribute, value) {
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}
	if (linecolor === 'rgba(0, 0, 0, 0)') {
		return false;
	} else return true;
}


Line.getPoints = function(){

	var dir = this.getAttribute("direction");
	var bbx = this.getViewBoundingBoxX();
	var bby = this.getViewBoundingBoxY();
	var bbw = this.getViewBoundingBoxWidth();
	var bbh = this.getViewBoundingBoxHeight();
	var P1;
	var P2;
	
	if(dir == 1 || dir == 3){
	
		P1 = {
			x : bbx,
			y : bby
		}
		
		P2 = {
			x : (bbx+bbw),
			y : (bby+bbh)
		}
		
	}
	if(dir == 2 || dir == 4){
	
		P1 = {
			x : (bbx+bbw),
			y : bby
		}
		
		P2 = {
			x : bbx,
			y : (bby+bbh)
		}
	
	}
	
	var LS = this.getAttribute('linesize');
	
	if(LS == 1){	
		return [P1, P2]
	}

	var dx = P1.x - P2.x;
	var dy = P1.y - P2.y;
					
	var absval = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
			
	dy = dy/absval;
	dx = dx/absval;
	
	var C1 = {
		x : P1.x + (dy)*LS/2,
		y : P1.y + (-dx)*LS/2
	}
	
	var C2 = {
		x : P1.x + (-dy)*LS/2,
		y : P1.y + (dx)*LS/2
	}
	
	var C3 = {
		x : P2.x + (-dy)*LS/2,
		y : P2.y + (dx)*LS/2
	}
	
	var C4 = {
		x : P2.x + (dy)*LS/2,
		y : P2.y + (-dx)*LS/2
	}
	
	return [C1, C2, C3, C4];

}


//calculate the Intersection point between a line object and a line (described by a1 and a2)
//this method will only return the first intersection point
Line.IntersectionObjectLine = function(a1, a2){

	var P = this.getPoints();
			
	var t;		
	for(var j = 0; j< P.length; j++){
		t = j+1;
		if(t == P.length) t = 0;
		var Int = this.IntersectionLineLine(a1, a2, P[j], P[t]);
		if(typeof Int.x != 'undefined' && typeof Int.y != 'undefined'){
			return Int;
		}
		if(Int == "coincident") return Int;
	}
	
	return "no intersection";
	
}