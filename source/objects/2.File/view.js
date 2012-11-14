/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


File.createRepresentation = function() {

	var rep = GUI.svg.group(this.getAttribute('id'));

	var rect = GUI.svg.rect(rep, 0,0,10,10);
	$(rect).attr("fill", "transparent");
	$(rect).addClass("borderRect");

	GUI.svg.image(rep, 0, 0, 10, 10, this.getFileIcon());
	
	rep.dataObject=this;
	
	this.initGUI(rep);
	
	this.updateThumbnail();
	
	return rep;
	
}

File.draw = function(external) {
	
	GeneralObject.draw.call(this,external);
	
	if (this.hasContent() == false || this.getAttribute("preview") == false) {
		
		this.setViewWidth(64);
		this.setViewHeight(64);
		
	}
	
	var rep = this.getRepresentation();
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("rect").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}
	
}

File.getFileIcon=function() {

	var typeIcon = "file";
	var mimeType = this.getAttribute("mimeType");
	
	//TODO: extend
	if (mimeType.indexOf('image') != -1) typeIcon = "image";
	if (mimeType.indexOf('msexcel') != -1 || mimeType.indexOf('ms-excel') != -1 || mimeType.indexOf('officedocument.spreadsheetml') != -1) typeIcon = "excel";
	if (mimeType == 'application/zip') typeIcon = "archive";
	if (mimeType == 'application/pdf') typeIcon = "pdf";
	if (mimeType.indexOf('mspowerpoint') != -1 || mimeType.indexOf('ms-powerpoint') != -1 || mimeType.indexOf('officedocument.presentationml') != -1) typeIcon = "powerpoint";
	if (mimeType.indexOf('text') != -1) typeIcon = "text";
	if (mimeType.indexOf('msword') != -1 || mimeType.indexOf('ms-word') != -1 || mimeType.indexOf('officedocument.wordprocessingml') != -1) typeIcon = "word";
	
	return "../../guis.common/images/fileicons/"+typeIcon+".png";
	
}

File.updateThumbnail=function(){

	var rep=this.getRepresentation();

	if (this.hasContent() == false) {
		
		GeneralObject.draw.call(this);
		
		$(rep).find("image").attr("href", "../../guis.common/images/fileicons/upload.png");
		
	} else if (this.getAttribute("preview") == false) {	
		/* show object type icon */
		
		GeneralObject.draw.call(this);
		
		$(rep).find("image").attr("href", this.getFileIcon());
	
	} else {
		/* show thumbnail */
		
		GeneralObject.draw.call(this);
	
		$(rep).find("image").attr("href", this.getPreviewContentURL());
	
	}

}



File.setViewWidth = function(value) {
	
	$(this.getRepresentation()).find("image").attr("width", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("width", parseInt(value));

	GeneralObject.setViewWidth.call(this, value);
	
}

File.setViewHeight = function(value) {

	$(this.getRepresentation()).find("image").attr("height", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("height", parseInt(value));
	GeneralObject.setViewHeight.call(this, value);

}




/* get the width of the objects bounding box */
File.getViewBoundingBoxWidth = function() {
	if (this.hasContent() == false || this.getAttribute("preview") == false) {
		return 64;
	} else {
		return GeneralObject.getViewBoundingBoxWidth.call(this);
	}
}

/* get the height of the objects bounding box */
File.getViewBoundingBoxHeight = function() {
	if (this.hasContent() == false || this.getAttribute("preview") == false) {
		return 64;
	} else {
		return GeneralObject.getViewBoundingBoxHeight.call(this);
	}
}