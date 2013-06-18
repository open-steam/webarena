/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Subroom.getStatusIcon = function() {
	return this.getIconPath() + "/link";
}

Subroom.getIconText = function() {
    return this.getAttribute("name");
}
