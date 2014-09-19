/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


SoundIndicator.getIconText = function() {
	return this.getAttribute("name");
}

SoundIndicator.getStatusIcon = function() {
	return this.getIconPath() + "/big";
}
