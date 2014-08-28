/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


VGA.getIconText = function() {
	return this.getAttribute("name");
}

VGA.getStatusIcon = function() {
	return this.getIconPath() + "/big";
}
