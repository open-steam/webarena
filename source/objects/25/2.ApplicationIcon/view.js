/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


ApplicationIcon.getIconText = function() {
	return this.getAttribute("name");
}

ApplicationIcon.getStatusIcon = function() {
	return this.getIconPath() + "/big";
}
