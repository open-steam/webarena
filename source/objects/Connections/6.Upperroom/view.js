/**
 *    Webarena - A webclient for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2011
 *
 */

Upperroom.getStatusIcon = function() {
    return this.getIconPath() + "/link";
}

Upperroom.getIconText = function() {
    return this.getAttribute("name");
}

Upperroom.dblclickHandler = function(event) {

	if(!this.inPlaceEditingMode){
		if(event.target.localName == "image"){
            Modules.ObjectManager.goParent();
		}
	
		if(event.target.localName == "tspan"){
			this.editText();
		}
	}	
}
