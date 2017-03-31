/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Textarea.draw=function(external){

	var rep=this.getRepresentation();
	
	this.drawDimensions(external);
	
	this.setViewWidth(this.getAttribute('width'));
	this.setViewHeight(this.getAttribute('height'));

	var linesize = this.getAttribute('linesize')-1+1;
	
	if (linesize > 0) {
		
		$(rep).find("body>div").css("border-color", this.getAttribute('linecolor'));
		$(rep).find("body>div").css("border-width", this.getAttribute('linesize'));
		$(rep).find("body>div").css("border-style", "solid");
		$(rep).find("body>div>div").css("padding", "5px");
		
	} else {
		
		$(rep).find("body>div").css("border-color", "none");
		$(rep).find("body>div").css("border-width", "0px");
		$(rep).find("body>div").css("border-style", "solid");
		$(rep).find("body>div>div").css("padding", "0px");
		
	}
	
	$(rep).find("body>div").css("background-color", this.getAttribute('fillcolor'));
	
	$(rep).find("body").css("font-size", this.getAttribute('font-size'));
	$(rep).find("body").css("font-family", this.getAttribute('font-family'));
	$(rep).find("body").css("color", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));
	
	if (!$(rep).hasClass("webarena_ghost")) {
		if (this.getAttribute("visible") || this.selected) {
			$(rep).css("visibility", "visible");
		} else {
			$(rep).css("visibility", "hidden");
		}
	}
	
	this.showOrHide();

	var that=this;
	
	this.getContentAsString(function(text){

		if(text!=that.oldContent){

            text = htmlEncode(text);

			$(rep).find("body>div>div").html(text);
		}
		
		that.oldContent=text;
		
	});
	
	this.updateInnerHeight();
    this.adjustControls();
}


Textarea.updateInnerHeight = function() {
	
	var rep=this.getRepresentation();

	$(rep).find("body").css("height", ($(rep).attr("height"))+"px");
	$(rep).find("body>div").css("height", ($(rep).attr("height")-(2*parseInt(this.getAttribute('linesize'))))+"px");
	
}


Textarea.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");
	$(body).html('<div class="overfloating-y"><div>TEXT</div></div>');

	$(rep).append(body);
	
	$(rep).find("body").append('<textarea></textarea>');
	
	$(rep).find("textarea").hide();

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}


Textarea.editText = function() {

	var rep = this.getRepresentation();
	
	var self = this;
	
	var content = this.getContentAsString();
	
	$(rep).find("textarea").css("font-size", self.getAttribute('font-size')+'px');
	$(rep).find("textarea").css("font-family", self.getAttribute('font-family'));
	$(rep).find("textarea").css("color", self.getAttribute('font-color'));
	$(rep).find("textarea").css("width", (rep.getBoundingClientRect().width-6)+'px');
	$(rep).find("textarea").css("height", (rep.getBoundingClientRect().height-6)+'px');
	$(rep).find("textarea").val(content);
	$(rep).find("textarea").show();
	
	$(rep).find(".overfloating-y").hide();
	
	$(rep).find("textarea").focus();

	this.inPlaceEditingMode = true;
	GUI.inPlaceEditingObject = this.id;
	
}


Textarea.adjustControls = function() {
	this.updateInnerHeight();
	GeneralObject.adjustControls.call(this);
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
Textarea.checkTransparency = function(attribute, value) {
	if (attribute === 'fillcolor') {
		var fillcolor = value;
	} else {
		var fillcolor = this.getAttribute('fillcolor');
	}
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
	if ((fillcolor === 'rgba(0, 0, 0, 0)' && linecolor === 'rgba(0, 0, 0, 0)' && fontcolor === 'rgba(0, 0, 0, 0)') || (fillcolor === 'rgba(0, 0, 0, 0)' && linecolor === 'rgba(0, 0, 0, 0)' && this.getContentAsString().trim() === '')) {
		return false;
	} else return true;
}


/**
 * Called when inplace editing ends
 */
Textarea.saveChanges = function() {

	if(this.inPlaceEditingMode){

		var rep = this.getRepresentation();
	
		var newContent = $(rep).find("textarea").val();
	
		this.inPlaceEditingMode = false;
		GUI.inPlaceEditingObject = false;
	
		this.setContent(newContent);
	
		$(rep).find("textarea").hide();
	
		$(rep).find(".overfloating-y").show();
		
		this.unblock();
	}
	
}

Textarea.doNotSaveOnEnterKey=true;