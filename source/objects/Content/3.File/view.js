/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

WAFile.draw = function(external) {
	
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

    if (this.getIconText()) {
        this.renderText(this.getIconText());
    } else {
        $(rep).find("text").remove();
    }
	
	if ($("#imagePreviewDialog_"+this.id).dialog( "isOpen" ) != true){
		$(rep).css("opacity", (this.getAttribute('opacity')/100));
	}
	
	if (!$(rep).hasClass("selected")) {
		var linecolor = this.getAttribute('linecolor');
		if(linecolor == "rgba(0, 0, 0, 0)"){
			$(rep).find("rect").removeAttr("stroke");
			$(rep).find("rect").removeAttr("stroke-width");
		}
		else{
			$(rep).find("rect").attr("stroke", linecolor);
			$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
		}
	}
	
	this.createPixelMap();
}

/* get the width of the objects bounding box */
WAFile.getViewBoundingBoxWidth = function() {
	//if (this.hasContent() == false || this.getAttribute("preview") == false) {
	if (this.getAttribute("bigIcon")) {
		return 64;
	} else return 32;
	//} else {
		//return GeneralObject.getViewBoundingBoxWidth.call(this);
	//}
}

/* get the height of the objects bounding box */
WAFile.getViewBoundingBoxHeight = function() {
	//if (this.hasContent() == false || this.getAttribute("preview") == false) {
	if (this.getAttribute("bigIcon")) {
		return 64;
	} else return 32;
	//} else {
		//return GeneralObject.getViewBoundingBoxHeight.call(this);
	//}
}

WAFile.getStatusIcon = function() {
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
	/*
	else {
		return this.getPreviewContentURL();
	}
	*/
}


WAFile.getIconText = function() {
    //if ((this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) && this.hasContent()) {
    return this.getAttribute("name");
    //} else return false;
}


WAFile.openImage = function(){
	
	var that = this;
	
	if ($("#imagePreviewDialog_"+this.id).length == 0) {
		
		$("body").first().append('<div id="imagePreviewDialog_'+this.id+'" title='+this.getAttribute("name")+'><image width="100%" height="100%" src="'+this.getPreviewContentURL()+'"></image></div>');
	
		$("#imagePreviewDialog_"+this.id).dialog({
			//autoOpen: false,
			minWidth: 57,
			width: 57,
			height: 57,
			position: { my: "left top", at: "left top", of: $("#"+that.id).find("image")}
		});
	
		var img = $("#imagePreviewDialog_"+this.id).find("img")[0];

		$(img).on("load", function(){
		
			var w = $(img).context.naturalWidth;
			var h = $(img).context.naturalHeight;
		
			that.openImageAnimation(w, h);
		});
	
		$("#imagePreviewDialog_"+this.id).on( "dialogbeforeclose", function(event, ui) {
		
			$("#imagePreviewDialog_"+that.id).animate({
				height: that.getAttribute("height")+"px"
			}, 1000);
		
			$("#imagePreviewDialog_"+that.id).parent().animate({
				width: that.getAttribute("width")+"px",
				height: that.getAttribute("height")+"px",
				top: (that.getAttribute("y")+30)+"px",
				left: that.getAttribute("x")+"px"
			}, 1000, function() {
				that.draw();
			});
			
		});
	
	}
	else{
		
		$("#imagePreviewDialog_"+this.id).dialog( "option", "position", {my: "left top", at: "left top", of: $("#"+this.id).find("image")});
		
		$("#imagePreviewDialog_"+this.id).dialog("open");
		
		that.openImageAnimation();
		
	}
}


WAFile.openImageAnimation = function(w, h){
	
	if(w){
		this.naturalWidth = w;
	}
	if(h){
		this.naturalHeight = h;
	}

	var that = this;

	$("#imagePreviewDialog_"+that.id).animate({
		height: that.naturalHeight+"px"
	}, 1000);
	
	$("#imagePreviewDialog_"+that.id).parent().animate({
		width: that.naturalWidth+"px",
		height: that.naturalHeight+"px",
		top: (that.getAttribute("y")+130)+"px",
		left: (that.getAttribute("x")+100)+"px"
	}, 1000);
	
	$("#"+this.id).css("opacity", 0.3)
	
}