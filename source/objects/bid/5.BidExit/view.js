/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

BidExit.getStatusIcon = function() {
	if (!this.getAttribute("destination")) {
		return this.getIconPath() + "/select";
	} else {
		return this.getIconPath() + "/link";
	}
}