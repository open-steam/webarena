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

Subroom.dblclickHandler = function(event) {

	if(!this.input){
		if(event.target.localName == "image"){
			this.follow(this.getAttribute("open in"));
		}
	
		if(event.target.localName == "tspan"){
			this.editText();
		}
	}	
}
