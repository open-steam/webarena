/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

CollText.draw = function(external) {

	var rep = this.getRepresentation();
	
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

	var that = this;
	
	this.getContentAsString(function(text) {

		if (text != that.oldContent) {
            text = htmlEncode(text);
			$(rep).find("body>div>div").html(text);
		}
		
		that.oldContent = text;
	});
	
	this.updateInnerHeight();
    this.adjustControls();
}


CollText.updateInnerHeight = function() {
	
	var rep = this.getRepresentation();

	$(rep).find("body").css("height", ($(rep).attr("height"))+"px");
	$(rep).find("body>div").css("height", ($(rep).attr("height")-(2*parseInt(this.getAttribute('linesize'))))+"px");
	
}


CollText.createRepresentation = function() {

	var rep = GUI.svg.other("foreignObject");
	rep.dataObject = this;
	var body = document.createElement("body");

	$(body).html('<div class="overfloating-y"><div>TEXT</div></div>');
	$(rep).append(body);
	$(rep).attr("id", this.getAttribute('id'));
	this.initGUI(rep);

	// create a pad holding the object's content
	$.get(ObjectManager.Pads.server + '/api/1.2.7/createPad' +
	      '?apikey=' + ObjectManager.Pads.apikey +
	      '&padID=' + ObjectManager.getRoomID() + this.id + 'content');

	return rep;
}



CollText.editText = function() {
	var cText = this.id,
		padEmbed = '<iframe src="' + ObjectManager.Pads.server + '/p/' +
				   ObjectManager.getRoomID() + this.id + 'content' +
				   '?showChat=false" width="800" height="480" style="border:none"></iframe>',
		passThrough = {
			beforeClose: function(event, ui) {
				ObjectManager.Pads.updateRepresentation(cText);
			}
		};

	ObjectManager.Pads.showDefault();
	GUI.dialog('Edit text', padEmbed, {}, 'auto', passThrough);

}


CollText.adjustControls = function() {
	this.updateInnerHeight();
	GeneralObject.adjustControls.call(this);
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
CollText.checkTransparency = function(attribute, value) {
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
