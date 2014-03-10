/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


Exit.getIconText = function() {
	return this.getAttribute("name");
}

Exit.getStatusIcon = function() {
	var destination=this.getAttribute('destination');
	
	if (!destination) {
		return this.getIconPath() + "/select";
	} else {
		return this.getIconPath() + "/link";
	}
}
