/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

Textarea.draw=function(){
	
	var rep=this.getRepresentation();
	
	this.setViewX(this.getAttribute('x'));
	this.setViewY(this.getAttribute('y'));
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

	var that=this;
	
	this.fetchContentString(function(text){

		if(text!=that.oldContent){
			text = text.replace(/[\r\n]+/g, "<br />");
			$(rep).find("body>div>div").html(text);
		}
		
		that.oldContent=text;
		
	});

}


Textarea.updateInnerHeight = function() {
	
	var rep=this.getRepresentation();
	
	$(rep).find("body").css("height", (this.getAttribute('height'))+"px");
	$(rep).find("body>div").css("height", (this.getAttribute('height')-(2*parseInt(this.getAttribute('linesize'))))+"px");
	
}


Textarea.createRepresentation = function() {
	
	var rep = GUI.svg.other("foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");
	$(body).html('<div><div>TEXT</div></div>');

	$(rep).append(body);

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}



Textarea.editText = function() {
	
	GUI.editText(this, true, this.getViewWidth(), this.getViewHeight());
	
}




/* view setter */


Textarea.setViewHeight = function(value) {
	this.updateInnerHeight();
	$(this.getRepresentation()).attr("height", parseInt(value));
	GUI.adjustContent(this);
}



/* get the x position of the objects bounding box (this is the left position of the object) */
Textarea.getViewBoundingBoxX = function() {
return parseInt(this.getAttribute("x"));
}

/* get the y position of the objects bounding box (this is the top position of the object) */
Textarea.getViewBoundingBoxY = function() {
	return parseInt(this.getAttribute("y"));
}

/* get the width of the objects bounding box */
Textarea.getViewBoundingBoxWidth = function() {
		return parseInt(this.getAttribute("width"));
}

/* get the height of the objects bounding box */
Textarea.getViewBoundingBoxHeight = function() {
		return parseInt(this.getAttribute("height"));	
}


