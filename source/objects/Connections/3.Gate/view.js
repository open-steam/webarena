/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


Gate.getIconText = function() {
	return this.getAttribute("name");
}

Gate.getStatusIcon = function() {
	var destination=this.getAttribute('destination');
	
	if (!destination) {
		return this.getIconPath() + "/select";
	} else {
		return this.getIconPath() + "/link";
	}
}

//Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a>             is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a></div>