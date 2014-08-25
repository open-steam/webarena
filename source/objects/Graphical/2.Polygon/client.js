/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/


/**
*	determine if the Poylgon (not only the bounding box) intersects with the square x,y,width,height
*/
Polygon.objectIntersectsWith = function(ox,oy,ow,oh){
	if (!this.isGraphical) return false;

	//check if the square intersects the bounding box
	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();

	if (ox+ow<thisx) return false;
	if (ox>thisx+thisw) return false;
	if (oy+oh<thisy) return false;
	if (oy>thisy+thish) return false;
	
	//check if the square surrounds the Polygon completely (by checking if the square contains all points of the Polygon)
	var P = this.getPoints();
	var counter = 0;
	for(var j = 0; j< P.length-1; j++){
		if(P[j].x > ox && P[j].x < (ox+ow) && P[j].y > oy && P[j].y < (oy+oh)) counter++;	
	}
	
	if(counter == P.length-1) return true;
	
	var cornerpoints = [{ x:ox, y:oy}, { x:(ox+ow), y:oy}, { x:(ox+ow), y:(oy+oh)}, { x:ox, y:(oy+oh)}];
	
	var c;
	for(var i = 0; i<cornerpoints.length; i++){
		c = i+1;
		if(c == cornerpoints.length) c = 0;
		var Int = this.IntersectionObjectLine(cornerpoints[i], cornerpoints[c], 0);
		if(Int != "no intersection") return true;
	}
	
	return false;
	
}
	
