/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

File.draw = function(external) {
	
	GeneralObject.draw.call(this,external);
	
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
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}
	
	this.createPixelMap();
}

/* get the width of the objects bounding box */
File.getViewBoundingBoxWidth = function() {
	if (this.hasContent() == false || this.getAttribute("preview") == false) {
		if (this.getAttribute("bigIcon")) {
			return 64;
		} else return 32;
	} else {
		return GeneralObject.getViewBoundingBoxWidth.call(this);
	}
}

/* get the height of the objects bounding box */
File.getViewBoundingBoxHeight = function() {
	if (this.hasContent() == false || this.getAttribute("preview") == false) {
		if (this.getAttribute("bigIcon")) {
			return 64;
		} else return 32;
	} else {
		return GeneralObject.getViewBoundingBoxHeight.call(this);
	}
}

File.getStatusIcon = function() {
	if (this.hasContent() == false) {
		return this.getIconPath() + "/upload";
	} else if (this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {	
		var typeIcon = "file";
		var mimeType = this.getAttribute("mimeType");
	
		//TODO: extend
		if (mimeType) {
			if (mimeType.indexOf('image') != -1) typeIcon = "image";
			if (mimeType.indexOf('msexcel') != -1 || mimeType.indexOf('ms-excel') != -1 || mimeType.indexOf('officedocument.spreadsheetml') != -1) typeIcon = "excel";
			if (mimeType == 'application/zip') typeIcon = "archive";
			if (mimeType == 'application/pdf') typeIcon = "pdf";
			if (mimeType.indexOf('mspowerpoint') != -1 || mimeType.indexOf('ms-powerpoint') != -1 || mimeType.indexOf('officedocument.presentationml') != -1) typeIcon = "powerpoint";
			if (mimeType.indexOf('text') != -1) typeIcon = "text";
			if (mimeType.indexOf('msword') != -1 || mimeType.indexOf('ms-word') != -1 || mimeType.indexOf('officedocument.wordprocessingml') != -1) typeIcon = "word";
		}

		return this.getIconPath() + "/" + typeIcon;
	} else {
		return this.getPreviewContentURL();
	}
}

File.getIconText = function() {
    if ((this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) && this.hasContent()) {
        return this.getAttribute("name");
    } else return false;
}
