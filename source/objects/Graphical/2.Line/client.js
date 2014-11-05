/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

Line.hasPixelAt=function(x,y){
	
	//assume, that the GeneralObject is full of pixels.
	//override this if you can determine better, where there
	//object is nontransparent
	
	var max=(this.getAttribute('linesize'))+5;
	var min=max*-1;
	
	for (var i=min;i<=max;i++){
		for (var j=min;j<=max;j++){
			if (this.boxIntersectsWith(x+i,y+j,0,0)) return true;
		}	
	}
	
	return false;
}


/**
*	determine if the Line (not only the bounding box) intersects with the square x,y,width,height
*/
Line.objectIntersectsWith = function(ox, oy, ow, oh){

	if (!this.isGraphical) return false;

	//check if the square surrounds the Line completely (by checking if the square contains all points of the Line)
	var P = this.getPoints();
	
	var counter = 0;
	for(var j = 0; j< P.length; j++){
		if(P[j].x > ox && P[j].x < (ox+ow) && P[j].y > oy && P[j].y < (oy+oh)) counter++;
	}
	
	if(counter == P.length) return true;
	
	var cornerpoints = [{ x:ox, y:oy}, { x:(ox+ow), y:oy}, { x:(ox+ow), y:(oy+oh)}, { x:ox, y:(oy+oh)}];
	
	var c;
	for(var i = 0; i<cornerpoints.length; i++){
		c = i+1;
		if(c == cornerpoints.length) c = 0;
		var Int = this.IntersectionObjectLine(cornerpoints[i], cornerpoints[c]);
		if(Int != "no intersection") return true;
	}
	
	return false;
	
}