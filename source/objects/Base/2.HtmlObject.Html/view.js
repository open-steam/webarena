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
	
	this.updateContent();
	
}


HtmlObject.updateContent = function() {
	
	var rep=this.getRepresentation();
	
	this.getContentAsString(function(text){

		if(text!=that.oldContent){
			$(rep).find("body").html(text);
		}
		
		that.oldContent=text;
		
	});
	
}


HtmlObject.createRepresentation = function(parent) {
	
	var rep = GUI.svg.other(parent,"foreignObject");

	rep.dataObject=this;
	
	var body = document.createElement("body");
	
	body.dataObject=this;

	$(rep).append(body);

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}


/**
*   getArenaObject
*
*	gets the WebArenaObject for a given htmlobject by going through the dom structure
*/
HtmlObject.getArenaObject=function(htmlobject){
	
	if (!htmlobject) return undefined;
	
	if (htmlobject.dataObject) return htmlobject.dataObject;
	
	return this.getArenaObject(htmlobject.parentNode);
	
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
