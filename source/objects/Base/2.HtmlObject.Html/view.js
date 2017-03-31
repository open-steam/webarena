/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/

HtmlObject.draw=function(external){

	var rep=this.getRepresentation();
	
	this.drawDimensions(external);
	
	this.setViewWidth(this.getAttribute('width'));
	this.setViewHeight(this.getAttribute('height'));

	$(rep).attr("layer", this.getAttribute('layer'));

	var that=this;
	
	this.updateHTMLContent();
	this.showOrHide();	
}


HtmlObject.updateContent = function() {
	console.log('ERROR: This should not be called any more!');
}

HtmlObject.createHTMLContent = function() {
	
	var rep=this.getRepresentation();
	
	$(rep).find("body").html('HTML CONTENT');
	
}

HtmlObject.updateHTMLContent = function() {
	
	var rep=this.getRepresentation();
	
	$(rep).find("body").html('UPDATED HTML CONTENT');
	
}


HtmlObject.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");
	
	body.dataObject=this;

	$(rep).append(body);

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	this.createHTMLContent();
	return rep;
	
}

/**
*
*  setHTML
*
*  sets the html code of the HTMLObject
*
*/
HtmlObject.setHTML=function(text){
	var rep=this.getRepresentation();
	$(rep).find("body").html(text);
}
