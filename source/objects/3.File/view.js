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

	var SVGImage=GUI.svg.image(rep, 0, 0, 10, 10, this.getFileIcon());

	this.createPixelMap(SVGImage);
	
	rep.dataObject=this;
	
	this.initGUI(rep);
	
	this.updateThumbnail();

    if(this.hasContent() != false && this.getAttribute("preview") == false){
        this.renderFilename(rep);
    }

	
	return rep;
	
}

File.createPixelMap=ImageObject.createPixelMap;

File.getFilename = function() {
	return this.getAttribute("name");
}

File.renderFilename = function (){
	
	var rep = this.getRepresentation();
	
    var filename = this.getFilename();
    
    //split the text after a maximum of 17 characters
    
    var lineLength=17;
    var splitTextVal=[];
    var temp=filename;
    
    while(temp){
    	var test=temp.substring(0,lineLength);
    	var length=0;
    	
    	if (test.lastIndexOf(' ')>0 && test.lastIndexOf(' ')>length) length=test.lastIndexOf(' ')+1;
    	if (test.lastIndexOf('.')>0 && test.lastIndexOf('.')>length) length=test.lastIndexOf('.')+1;
    	if (test.lastIndexOf('-')>0 && test.lastIndexOf('-')>length) length=test.lastIndexOf('-')+1;
    	
    	if (length==0) length=lineLength;
    	
    	var line=temp.substring(0,length);
    	splitTextVal.push(line);
    	var temp=temp.substring(length);
    }
    
    var cTexts = GUI.svg.createText();

    $(rep).find("text").remove();

    for(var i = 0, len = splitTextVal.length; i< len ; i++){
        cTexts.span(splitTextVal[i], {'y' : 78 + i * 14, 'x': 0});
    }
    var text = GUI.svg.text(rep, 0, 75, cTexts);
    $(text).attr("font-size", 12);

	/* center text */
	$(rep).find("text").find("tspan").each(function() {
	
		/* .width() returns 0 in firefox. Trying to get the value differently then. */
		if ($(this).width() == 0) {
			var w = 32-Math.floor($(this)[0].getBoundingClientRect().width/2);
		} else {
			var w = 32-Math.floor($(this).width()/2);
		}
		
		$(this).attr("x", w);
		
	});

}

File.draw = function(external) {
	
	this.updateThumbnail();
	
	GeneralObject.draw.call(this,external);
	
	if (this.hasContent() == false || this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {
		
		this.setViewWidth(64);
		this.setViewHeight(64);
		
	}
	
	var rep = this.getRepresentation();

    if ((this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) && this.hasContent()) {
        this.renderFilename();
    } else {
        $(rep).find("text").remove();
    }

	
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

File.getUploadIcon = function() {
	return "../../guis.common/images/fileicons/upload.png";
}

File.updateThumbnail=function(){
	
	var newURL='';

	var rep=this.getRepresentation();

	if (this.hasContent() == false) {
		
		newURL=this.getUploadIcon();
		
	} else if (this.getAttribute("preview") == false || this.getAttribute("preview") == undefined) {	
		/* show object type icon */
		
		newURL=this.getFileIcon();
	
	} else {
		/* show thumbnail */
		
		newURL=this.getPreviewContentURL();
	
	}
	
	if (newURL!==$(rep).find("image").attr("href")){
		
		$(rep).find("image").attr("href", newURL);
	}
	
	this.createPixelMap();

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