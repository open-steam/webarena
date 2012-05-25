/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


File.createRepresentation = function() {

	var rep = GUI.svg.image(10, 10, 10, 10, this.getFileIcon());
	
	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	this.updateThumbnail();
	
	return rep;
	
}

File.draw = function() {
	
	GeneralObject.draw.call(this);
	
	if (this.hasContent() == false || this.getAttribute("preview") == false) {
		
		this.setViewWidth(64);
		this.setViewHeight(64);
		
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
		
		$(rep).attr("href", "../../guis.common/images/fileicons/upload.png");
		
	} else if (this.getAttribute("preview") == false) {	
		/* show object type icon */
		
		GeneralObject.draw.call(this);
		
		$(rep).attr("href", this.getFileIcon());
	
	} else {
		/* show thumbnail */
		
		GeneralObject.draw.call(this);
	
		$(rep).attr("href", this.getPreviewContentURL());
	
	}

}
