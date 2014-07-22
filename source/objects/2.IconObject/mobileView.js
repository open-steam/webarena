IconObject.createRepresentation = function(parent) {
	if (!this.isVisible()) {
		return;
	}
	var rep = document.createElement('div');
	rep.setAttribute('id', this.getAttribute('id'));
	$(parent).append(rep);
	
	$(rep).svg({settings: {width: '0px', height: '0px'}});
	var svg = $(rep).svg('get');
	var group = svg.group();
	
	// var rep = GUI.svg.group(parent,this.getAttribute('id'));
	
	var size = 32;
	if (this.getAttribute("bigIcon")) {
		size = 64;
	} 
	var rect = svg.rect(group, 0, 0, size, size);
	$(rect).attr("fill", "transparent");
	$(rect).addClass("borderRect");

	var SVGImage = svg.image(group, 0, 0, size, size, this.getStatusIcon());

	if (this.getIconText()) this.renderText(this.getIconText());
	
	this.createPixelMap(SVGImage);

	rep.dataObject=this;

	this.initGUI(rep);
	
	return rep;
	
}


IconObject.draw=function(external){
	var rep = this.getRepresentation();
	var group = $(rep).find('g');

	this.drawDimensions(external);

	if (this.getAttribute("bigIcon")) {
		//this.setAttribute("width", 64);
		//this.setAttribute("height", 64);
		//this.setViewWidth(64);
		//this.setViewHeight(64);
	} else {
		//this.setAttribute("width", 32);
		//this.setAttribute("height", 32);
		//this.setViewWidth(32);
		//this.setViewHeight(32);
	}

	group.attr("layer", this.getAttribute('layer'));
	
	if (this.getIconText()) this.renderText(this.getIconText());

	if (!group.hasClass("selected")) {
		group.find("rect").attr("stroke", this.getAttribute('linecolor'));
		group.find("rect").attr("stroke-width", this.getAttribute('linesize'));
	}

	if (!group.hasClass("webarena_ghost")) {
		
		if (this.selected) {
			group.css("visibility", "visible");
		} else {
			
			if (this.getAttribute("visible")) {
				
				if (external) {
					if (group.css("visibility") == "hidden") {
						/* fade in */
						group.css("opacity", 0);
						group.css("visibility", "visible");
						group.animate({
							"opacity" : 1
						}, {queue:false, duration:500});
					}
				} else {
					group.css("visibility", "visible");
				}
				
			} else {
				
				if (external) {
					if (group.css("visibility") == "visible") {
						/* fade out */
						group.css("opacity", 1);
						group.animate({
							"opacity" : 0
						}, {queue:false, 
							complete:function() {
								$(rep).css("visibility", "hidden");
							}
							});
					}
				} else {
					group.css("visibility", "hidden");
				}
				
			}
			
		}

		
	}

	this.createPixelMap();
}


IconObject.setViewWidth = function(value) {
	
	$(this.getRepresentation()).find("image").attr("width", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("width", parseInt(value));

	//GeneralObject.setViewWidth.call(this, value);
}

IconObject.setViewHeight = function(value) {

	$(this.getRepresentation()).find("image").attr("height", parseInt(value));
	$(this.getRepresentation()).find("rect").attr("height", parseInt(value));
	//GeneralObject.setViewHeight.call(this, value);
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
	
	if (this.getAttribute("bigIcon")) {
		var startX = 78;
		var widthHalf = 32;
	} else {
		var startX = 48;
		var widthHalf = 16;
	}
    
    //split the text after a maximum of 17 characters
    
    var lineLength=17;
    var splitTextVal=[];
    var temp=text;
    
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
        cTexts.span(splitTextVal[i], {'y' : startX + i * 14, 'x': 0});
    }
    var text = GUI.svg.text(rep, 0, 75, cTexts);
    $(text).attr("font-size", 12);

	/* center text */
	$(rep).find("text").find("tspan").each(function() {
	
		/* width of tspan elements is 0 in Firefox --> display multiline text left aligned in Firefox */
		if ($(rep).find("text").width() == 0) {
			var w = widthHalf-Math.floor($(this)[0].getBoundingClientRect().width/2);
		} else {
			var w = widthHalf-Math.floor($(this).width()/2);
		}
		
		$(this).attr("x", w);
		
	});

}

IconObject.updateIcon=function(){
	
	var newURL=this.getStatusIcon();
	var rep=this.getRepresentation();


	if (this.getAttribute("bigIcon")) {
		//this.setAttribute("width", 64);
		//this.setAttribute("height", 64);
		//this.setViewWidth(64);
		//this.setViewHeight(64);
	} else {
		//this.setAttribute("width", 32);
		//this.setAttribute("height", 32);
		//this.setViewWidth(32);
		//this.setViewHeight(32);
	}

	if (newURL!==$(rep).find("image").attr("href")){
		$(rep).find("image").attr("href", newURL);
	}
	
	if (this.getIconText()) this.renderText(this.getIconText());

	this.createPixelMap();
}