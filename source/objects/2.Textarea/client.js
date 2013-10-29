/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

/*
Textarea.afterSetContent=function(){

	GUI.updateLayers();

}

Textarea.afterSetAttribute=function(){

	GUI.updateLayers();

}
*/

Textarea.contentUpdated=function(){
	var that = this;
	var drawNewContent = function() {
		that.draw();
	}
	this.fetchContent(drawNewContent, true);
}