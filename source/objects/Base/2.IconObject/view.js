IconObject.createRepresentation = function(parent) {
	
	var rep = GUI.svg.group(parent,this.getAttribute('id'));
	
	var size = 32;
	if (this.getAttribute("bigIcon")) {
		size = 64;
	} 
	var rect = GUI.svg.rect(rep, 0, 0, size, size);
	$(rect).attr("fill", "transparent");
	$(rect).addClass("borderRect");

	var SVGImage=GUI.svg.image(rep, 0, 0, size, size, this.getStatusIcon());

	if (this.getIconText()) this.renderText(this.getIconText());
	
	this.createPixelMap(SVGImage);

	rep.dataObject=this;

	var SVGforeign = GUI.svg.other(rep,"foreignObject");
	
	var body = document.createElement("body");
	
	$(rep).find("foreignObject").append(body);
	
	$(rep).find("foreignObject").hide();
	
	this.initGUI(rep);
	
	return rep;
	
}


IconObject.draw=function(external){
	
	var rep=this.getRepresentation();

	this.drawDimensions(external);

	if (this.getAttribute("bigIcon")) {
		this.setViewWidth(64);
		this.setViewHeight(64);
	} else {
		this.setViewWidth(32);
		this.setViewHeight(32);
	}

	$(rep).attr("layer", this.getAttribute('layer'));
	
	if (this.getIconText()) this.renderText(this.getIconText());

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

	if (!$(rep).hasClass("webarena_ghost")) {
		
		if (this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			
			if (this.getAttribute("visible")) {
				
				if (external) {
					if ($(rep).css("visibility") == "hidden") {
						/* fade in */
						$(rep).css("opacity", 0);
						$(rep).css("visibility", "visible");
						$(rep).animate({
							"opacity" : 1
						}, {queue:false, duration:500});
					}
				} else {
					$(rep).css("visibility", "visible");
				}
				
			} else {
				
				if (external) {
					if ($(rep).css("visibility") == "visible") {
						/* fade out */
						$(rep).css("opacity", 1);
						$(rep).animate({
							"opacity" : 0
						}, {queue:false, 
							complete:function() {
								$(rep).css("visibility", "hidden");
							}
							});
					}
				} else {
					$(rep).css("visibility", "hidden");
				}
				
			}
			
		}

		
	}
	
	this.showOrHide();

	this.createPixelMap();
}


IconObject.setViewWidth = function(value) {
	
	$(this.getRepresentation()).find("image").attr("width", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("width", parseInt(value));

	GeneralObject.setViewWidth.call(this, value);
	
}

IconObject.setViewHeight = function(value) {

	$(this.getRepresentation()).find("image").attr("height", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("height", parseInt(value));
	GeneralObject.setViewHeight.call(this, value);

}

IconObject.dblclickHandler = function(event) {

	if(!this.inPlaceEditingMode){
		if(event.target.localName == "image"){
			this.execute(event);
		}
	
		if(event.target.localName == "tspan"){
			this.editText();		
		}
	}
}

IconObject.createPixelMap=function(SVGImage){
	
	if (!SVGImage) SVGImage=$(this.getRepresentation()).find("image")[0];
	
	var image = new Image();
	
	image.src=$(SVGImage).attr("href");
	
	var self=this;
	
	image.onload=function(){
		var bbox=SVGImage.getBoundingClientRect();
		var newCanvas = document.createElement('canvas');
		
		var width=0;
		var height=0;
		
		if (image.width>image.height){
			width=bbox.width;
			height=bbox.width*(image.height/image.width);
		} else {
			height=bbox.height;
			width=bbox.height*(image.width/image.height);
		}
		
		newCanvas.height=bbox.height;
		newCanvas.width=bbox.width;
		window.test=image;
		var ctx = newCanvas.getContext('2d');
		ctx.drawImage(image, (bbox.width-width)/2, (bbox.height-height)/2, width, height);
		//document.body.appendChild(newCanvas);
		
		SVGImage.hasPixelAtMousePosition=function(mouseX,mouseY){
			
			var bbox=SVGImage.getBoundingClientRect();
			
			var x=mouseX-bbox.left;
			var y=mouseY-bbox.top;
			var isThere=false;
			
			if (x<0) return false;
			if (y<0) return false;
			if (x>bbox.width) return false;
			if (y>bbox.height) return false;
			
			var imgd = ctx.getImageData(x-5, y-5, 10, 10);
			var pix = imgd.data;
			
			for (var i = 0, n = pix.length; i < n; i += 4) {
			    if(pix[i+3]) isThere=true;
			}
			
			return(isThere);
		}
		
		SVGImage.hasPixelAt=function(absX,absY){
			
			var bbox=SVGImage.getBoundingClientRect();
			
			var x=absX-bbox.left;
			var y=absY-bbox.top;
			var isThere=false;
			
			if (x<0) return false;
			if (y<0) return false;
			if (x>bbox.width) return false;
			if (y>bbox.height) return false;
			
			var imgd = ctx.getImageData(x, y, 1, 1);
			var pix = imgd.data;
			
			if(pix[2] != 255) isThere=true;
			
			return(isThere);
		}
		
	}
	
}

IconObject.getStatusIcon = function() {
	return this.getIconPath();
}

IconObject.getIconText = function() {
	return false;
}

IconObject.renderText = function (text){
	
	var rep = this.getRepresentation();
	
	$(rep).find("text").remove();
	
	if (!this.getAttribute('showCaption')) return;  // if no caption should be displayed, we can end here
	
	if (this.getAttribute("bigIcon")) {
		var startX = 78;
		var widthHalf = 32;
		var bigIcon=true;
	} else {
		var startX = 48;
		var widthHalf = 16;
		var bigIcon=false;
	}
    
    //split the text after a maximum of 17 characters
    
    var lineLength=17;
    var splitTextVal=[];
    var temp=text;
    
    while(temp){
    	if (!temp || !temp.substring) temp='';
    	
    	var test=temp.substring(0,lineLength);
    	var length=0;
    	
    	if (test.lastIndexOf(' ')>0 && test.lastIndexOf(' ')>length) length=test.lastIndexOf(' ')+1;
    	if (test.lastIndexOf('. ')>0 && test.lastIndexOf('. ')>length) length=test.lastIndexOf('. ')+2;
    	if (test.lastIndexOf('-')>0 && test.lastIndexOf('-')>length) length=test.lastIndexOf('-')+1;
    	
    	if (length==0) length=lineLength;
    	
    	var line=temp.substring(0,length);
    	splitTextVal.push(line);
    	var temp=temp.substring(length);
    }
    
    var cTexts = GUI.svg.createText();

    for(var i = 0, len = splitTextVal.length; i< len ; i++){
        cTexts.span(splitTextVal[i], {'y' : startX + i * 14, 'x': 0});
    }
    var text = GUI.svg.text(rep, 0, 75, cTexts);
    $(text).attr("font-size", 12);
	$(text).attr('pointer-events','fill');


	/* center text */
	$(rep).find("text").find("tspan").each(function(dum,ts) {
		
		var width=ts.getComputedTextLength();
		var maxWidth=(bigIcon)?65:33;
		var border=(maxWidth-width)/2;
		$(ts).attr("x", border);
		
	});

}

IconObject.updateIcon=function(){
	
	var newURL=this.getStatusIcon();
	var rep=this.getRepresentation();


	if (this.getAttribute("bigIcon")) {
		this.setViewWidth(64);
		this.setViewHeight(64);
	} else {
		this.setViewWidth(32);
		this.setViewHeight(32);
	}

	if (newURL!==$(rep).find("image").attr("href")){
		$(rep).find("image").attr("href", newURL);
	}
	
	if (this.getIconText()) this.renderText(this.getIconText());

	this.createPixelMap();
}

/**
 * Called after a double click on the text, enables the inplace editing
 */
IconObject.editText = function(){
	var rep = this.getRepresentation();
	
	$(rep).find("foreignObject").show();
	
	$(rep).find("body").append('<input type="text">');
	
	$(rep).find("foreignObject").attr("x", -60); 
	$(rep).find("foreignObject").attr("y", 75); 
	$(rep).find("foreignObject").attr("height", 25);
	$(rep).find("foreignObject").attr("width", 200);
	$(rep).find("foreignObject").attr('pointer-events','fill');
	
	$(rep).find("input").css("width", "186px"); 
	$(rep).find("input").css("font-size", "12px"); 
	$(rep).find("input").attr("value", this.getIconText()); 
	$(rep).find("input").attr("name", "newContent"); 
	
	$(rep).find("text").hide();
	
	$(rep).find("input").focus();
	
	this.inPlaceEditingMode = true;
	GUI.inPlaceEditingObject = this.id;
	
	this.block();
}


/**
 * Called after hitting the Enter key during the inplace editing
 */
IconObject.saveChanges = function() {

	if(this.inPlaceEditingMode){
		var rep = this.getRepresentation();
	
		var newContent = $(rep).find("input").val()

		$(rep).find("input").remove();
		
		$(rep).find("foreignObject").hide();
	
		$(rep).find("text").show();
	
		this.inPlaceEditingMode = false;
		GUI.inPlaceEditingObject = false;
	
		this.setAttribute("name", newContent);
		this.draw();
		this.unblock();
	}
}