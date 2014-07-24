/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

SimpleText.draw=function(external){
	
	var rep=this.getRepresentation();
	
	this.drawDimensions(external);

	//$(rep).attr("fill", this.getAttribute('fillcolor'));
	
	if (!$(rep).hasClass("selected")) {
		$(rep).find("text").attr("stroke", this.getAttribute('linecolor'));
		$(rep).find("text").attr("stroke-width", this.getAttribute('linesize'));
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
	
	GUI.svg.text(rep, 0, 0, "Text");

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));
	$(rep).css("cursor", "default");

	this.initGUI(rep);
	
	return rep;
	
}




SimpleText.editText = function() {
	
	GUI.editText(this);
	
}




/* get the y position of the objects bounding box (this is the top position of the object) */
SimpleText.getViewBoundingBoxY = function() {
	return this.getViewY();
}

/* get the height of the objects bounding box */
SimpleText.getViewBoundingBoxHeight = function() {
	var rep = this.getRepresentation();
	return this.getRepresentation().getBBox().height; //<--TODO: this value is too high
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
	if (fontcolor === 'transparent' && linecolor === 'transparent') {
		return false;
	} else return true;
}