/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Alejandro Sandoval Parra, University of Paderborn, 2015
*
*/

OpacityController.draw = function(external) {
	
	GeneralObject.draw.call(this, external);
	
	if (this.hasContent() == false || this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {
		
		if (this.getAttribute("bigIcon")) {
			this.setViewWidth(64);
			this.setViewHeight(64);
		} else {
			this.setViewWidth(32);
			this.setViewHeight(32);
		}
	}
	
	var rep = this.getRepresentation();

    if (this.getIconText()) {
        this.renderText(this.getIconText());
    } else {
        $(rep).find("text").remove();
    }
	
	$(rep).css("opacity", (this.getAttribute('opacity') / 100));
	
	if (!$(rep).hasClass("selected")) {
		var linecolor = this.getAttribute('linecolor');

		if (linecolor == "rgba(0, 0, 0, 0)") {
			$(rep).find("rect").removeAttr("stroke");
			$(rep).find("rect").removeAttr("stroke-width");
		} else {
			$(rep).find("rect").attr("stroke", linecolor);
			$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
		}
	}

	this.createPixelMap();
}

/* get the width of the objects bounding box */
OpacityController.getViewBoundingBoxWidth = function() {
	//return GeneralObject.getViewBoundingBoxWidth.call(this);
	return 64;
}

/* get the height of the objects bounding box */
OpacityController.getViewBoundingBoxHeight = function() {
	//return GeneralObject.getViewBoundingBoxHeight.call(this);
	return 64;
}

OpacityController.getStatusIcon = function() {
	//return this.hasContent() ? this.getIconPath() + "/color" : this.getIconPath() + "/black";
	return this.getIconPath() + "/black"
}

OpacityController.getIconText = function() {
    return this.getAttribute("Object ID"); // to show a text under the icon
}
