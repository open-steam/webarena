/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


Highlighter.draw=function(){

	var rep=this.getRepresentation();

	Paint.draw.call(this);

	$(rep).css("opacity", Highlighter.normalOpacity);
	$(rep).attr("normalOpacity", Highlighter.normalOpacity);
	
}