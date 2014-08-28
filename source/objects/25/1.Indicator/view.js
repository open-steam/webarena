/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


Indicator.getIconText = function() {
	return this.getAttribute("name");
}

Indicator.getStatusIcon = function() {
	return this.getIconPath() + "/big";
}
