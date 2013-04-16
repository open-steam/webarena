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