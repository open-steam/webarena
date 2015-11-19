/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

SimpleText.moveByTransform = function(){return true;};

SimpleText.draw=function(external){
	
	var rep=this.getRepresentation();
	
	this.drawDimensions(external);

	//$(rep).attr("fill", this.getAttribute('fillcolor'));
	
	if (!$(rep).hasClass("selected")) {
		var linecolor = this.getAttribute('linecolor');
		if(linecolor == "rgba(0, 0, 0, 0)"){
			$(rep).find("text").removeAttr("stroke");
			$(rep).find("text").removeAttr("stroke-width");
		}
		else{
			$(rep).find("text").attr("stroke", linecolor);
			$(rep).find("text").attr("stroke-width", this.getAttribute('linesize'));
		}
	}
	
	$(rep).find("text").attr("font-size", this.getAttribute('font-size'));
	$(rep).find("text").attr("font-family", this.getAttribute('font-family'));
	$(rep).find("text").attr("fill", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));

    var rotation = this.getAttribute("rotation") || 0;
    $(rep).find("text").attr("transform", "rotate(" + rotation + " 0 0)");

	if (!$(rep).hasClass("webarena_ghost")) {
		if (this.getAttribute("visible") || this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			$(rep).css("visibility", "hidden");
		}
	}

	var that=this;
	
	this.getContentAsString(function(data){
		if(data!=that.oldContent){
			if ((!data && !that.oldContent) || data == "") {
				$(rep).find("text").get(0).textContent='';
			} else {
				$(rep).find("text").get(0).textContent=data;
			}
		}
		
		that.oldContent=data;
		
		$(rep).find("text").attr("y", 0);
		$(rep).find("text").attr("y", rep.getBBox().y*(-1));
		
	});
	
	this.adjustControls();
	
}


SimpleText.createRepresentation = function(parent) {
	
	var rep = GUI.svg.group(parent,this.getAttribute('id'));
	
	rep.text = GUI.svg.text(rep, 0, 0, "Text");

	rep.input = GUI.svg.other(rep,"foreignObject");
	
	var body = document.createElement("body");
	
	$(rep).find("foreignObject").append(body);
	
	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));
	$(rep).css("cursor", "default");

	this.initGUI(rep);
	
	return rep;
	
}


/**
 * Called after a double click on the text, enables the inplace editing
 */
SimpleText.editText = function() {
	
	var rep = this.getRepresentation();
	
	var userAgent = navigator.userAgent;
    if(userAgent.indexOf('Android') > 0 && userAgent.indexOf('Chrome') > 0){
		//inplace editing of SimpleTexts on Android and Chrome does not work properly
		GUI.editText(this);
	}
	else{
		$(rep).find("foreignObject").show();
	
		$(rep).find("body").append('<input type="text">');
		$(rep).find("input").attr("name", "newContent");
		$(rep).find("input").attr("value", this.oldContent);
		$(rep).find("input").css("font-size", this.getAttribute('font-size')+"px");
		$(rep).find("input").css("font-family", this.getAttribute('font-family')); 
		$(rep).find("input").css("color", this.getAttribute('font-color'));
		$(rep).find("input").css("width", (rep.text.getBoundingClientRect().width+2)+"px"); 
		$(rep).find("input").css("height", (rep.text.getBoundingClientRect().height-3)+"px");
		$(rep).find("foreignObject").attr("height", rep.text.getBoundingClientRect().height+10);
		$(rep).find("foreignObject").attr("width", rep.text.getBoundingClientRect().width+26);
		
		$(rep).find("text").hide();
		
		$(rep).find("input").focus();
		
		this.input = true;
		GUI.input = this.id;
	}
    
    // Simple text box will be expanded (width)
    var that = this;
    var charWidth=0;
    var boxWidth = that.getRepresentation().getBBox().width;
    document.onkeydown = function(event){ 
            if(event.keyCode != 8){
                var inputChar = String.fromCharCode(event.keyCode);
                charWidth = that.getCharWidth(inputChar);
                var newWidth =boxWidth+charWidth;
                $(rep).find("input").css("width", newWidth+"px");
                boxWidth=newWidth;
            }
        }
}


/* get the y position of the objects bounding box (this is the top position of the object) */
SimpleText.getViewBoundingBoxY = function() {
	return this.getViewY();
}


/* get the height of the objects bounding box */
SimpleText.getViewBoundingBoxHeight = function() {
	var rep = this.getRepresentation();
	return this.getRepresentation().getBBox().height;
}


/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
SimpleText.checkTransparency = function(attribute, value) {
	if (attribute === 'font-color') {
		var fontcolor = value;
	} else {
		var fontcolor = this.getAttribute('font-color');
	}
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}
	if (fontcolor === 'rgba(0, 0, 0, 0)' && linecolor === 'rgba(0, 0, 0, 0)') {
		return false;
	} else return true;
}


/**
 * Called after hitting the Enter key during the inplace editing
 */
SimpleText.saveChanges =  function() {

	if(this.input){

		var rep = this.getRepresentation();
	
		var newContent = $(rep).find("input").val();
        
        
		$(rep).find("input").remove();
	
		$(rep).find("foreignObject").hide();
        
	
		$(rep).find("text").show();
	
		this.input = false;
		GUI.input = false;
	
		this.setContent(newContent);

		this.draw();

	}
	
}

SimpleText.getCharWidth = function(txt){
        var c=document.createElement('canvas');
        var ctx=c.getContext('2d');
        ctx.font = this.getAttribute('font-size') + 'px' + this.getAttribute('font-family');
        var length = ctx.measureText(txt).width;
        return length;
}