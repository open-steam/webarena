/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

File.draw = function(external) {
	
	GeneralObject.draw.call(this,external);
	
	//if (this.hasContent() == false || this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {
		
	if (this.getAttribute("bigIcon")) {
		this.setViewWidth(64);
		this.setViewHeight(64);
	} else {
		this.setViewWidth(32);
		this.setViewHeight(32);
	}
		
	//}
	
	var rep = this.getRepresentation();
	var group = $(rep).find('g');

    if (this.getIconText()) {
        this.renderText(this.getIconText());
    } else {
        group.find("text").remove();
    }
	
	if (!group.hasClass("selected")) {
		var linecolor = this.getAttribute('linecolor');
		if(linecolor == "rgba(0, 0, 0, 0)"){
			group.find("rect").removeAttr("stroke");
			group.find("rect").removeAttr("stroke-width");
		}
		else{
			group.find("rect").attr("stroke", linecolor);
			group.find("rect").attr("stroke-width", this.getAttribute('linesize'));
		}
	}
	
	this.createPixelMap();
	
	var doScale = false;
	if (this.getAttribute("width") > $(window).width() ||
		this.getAttribute("height") > $(window).height) {
		doScale = true;
	}
	var scale = 1;
	if (doScale) {
		var imgAspect = this.getAttribute("width") / this.getAttribute("height");
		var wndAspect = $(window).width() / $(window).height();
		if (imgAspect > wndAspect) {
			scale = $(window).width() / this.getAttribute("width");
		} else if (imgAspect < wndAspect) {
			scale = $(window).height() / this.getAttribute("height");
		}
	}
	
	var scaledWidth = this.getAttribute("width") * scale;
	var scaledHeight = this.getAttribute("height") * scale;
	$(rep).find('svg').attr("width", scaledWidth);
	$(rep).find('svg').attr("height", scaledHeight);
	group.attr("width", scaledWidth);
	group.attr("height", scaledHeight);
	group.find("image").attr("width", scaledWidth);
	group.find("image").attr("height", scaledHeight);
	group.attr("transform", "translate(0, 0)");// + ($(window).width() / 2 - scaledWidth / 2) + ", " + ($(window).width() / 2 - scaledHeight / 2) + ")");
	//$(rep).attr("height", this.getViewHeight() / 2);
	//$(rep).attr("height", this.getViewHeight() / 2);
}

/* get the width of the objects bounding box */
File.getViewBoundingBoxWidth = function() {
	//if (this.hasContent() == false || this.getAttribute("preview") == false) {
	if (this.getAttribute("bigIcon")) {
		return 64;
	} else return 32;
	//} else {
		//return GeneralObject.getViewBoundingBoxWidth.call(this);
	//}
}

/* get the height of the objects bounding box */
File.getViewBoundingBoxHeight = function() {
	//if (this.hasContent() == false || this.getAttribute("preview") == false) {
	if (this.getAttribute("bigIcon")) {
		return 64;
	} else return 32;
	//} else {
		//return GeneralObject.getViewBoundingBoxHeight.call(this);
	//}
}

File.getStatusIcon = function() {
	if (this.hasContent() == false) {
		return this.getIconPath() + "/upload";
	} else { //if (this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {	
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
	} 
	//else {
		//return this.getPreviewContentURL();
	//}
}

File.getIconText = function() {
    //if ((this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) && this.hasContent()) {
    return this.getAttribute("name");
    //} else return false;
}
