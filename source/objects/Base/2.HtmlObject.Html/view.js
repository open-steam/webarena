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

	$(rep).append(body);

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}
<<<<<<< HEAD
=======




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
>>>>>>> 40c356ef77b4f514b29de18a33d093e36e446e6f
