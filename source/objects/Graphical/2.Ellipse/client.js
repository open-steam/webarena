/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/


Ellipse.clientRegister=function(){
	
	Ellipse.parent.clientRegister.call(this);
}

/**
*	determine if the Ellipse (not only the bounding box) intersects with the square x,y,width,height
*/
Ellipse.objectIntersectsWith = function(otherx,othery,otherwidth,otherheight){
	if (!this.isGraphical) return false;

	//check if the square intersects the bounding box
	var thisx = this.getViewBoundingBoxX();
	var thisy = this.getViewBoundingBoxY();
	var thisw = this.getViewBoundingBoxWidth();
	var thish = this.getViewBoundingBoxHeight();

	if (otherx+otherwidth<thisx) return false;
	if (otherx>thisx+thisw) return false;
	if (othery+otherheight<thisy) return false;
	if (othery>thisy+thish) return false;
		
	//calculate the midPoint of the ellipse and the cornerpoints of the square	
	var midP = {
		x : thisx+(thisw/2),
		y : thisy+(thish/2)
	}
		
	var cornerpoints = [{ x:otherx, y:othery}, { x:otherx+otherwidth, y:othery}, { x:otherx+otherwidth, y:othery+otherheight}, { x:otherx, y:othery+otherheight}];
	
	var Q = "";
	
	//compute quadrant of the cornerpoints (with the midpoint of the ellipse as the nullpoint):
	var key;
	for(key in cornerpoints){
		if(cornerpoints[key].x > midP.x && cornerpoints[key].y < midP.y){
			Q = Q + "1";
		}
		if(cornerpoints[key].x < midP.x && cornerpoints[key].y < midP.y){
			Q = Q + "2";
		}
		if(cornerpoints[key].x < midP.x && cornerpoints[key].y > midP.y){
			Q = Q + "3";
		}
		if(cornerpoints[key].x > midP.x && cornerpoints[key].y > midP.y){
			Q = Q + "4";
		}
	}	
	
	if(Q != "1111" && Q != "2222" && Q != "3333" && Q != "4444"){
		return true;
	}

	//now all cornerpoints lie in one quadrant. Check if all cornerpoints are outside of the ellipse object
	for(var i = 0; i<cornerpoints.length; i++){
		var Int = this.IntersectionObjectLine(cornerpoints[i], midP);
		var length1 = Math.sqrt(Math.pow(cornerpoints[i].x-midP.x, 2) + Math.pow(cornerpoints[i].y-midP.y, 2));    
		var length2 = Math.sqrt(Math.pow(Int.x-midP.x, 2) + Math.pow(Int.y-midP.y, 2)); 
		
		if(length1<length2){
			return true;
		}
	}

	return false;
	
}
	
