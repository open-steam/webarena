/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


Exit.createRepresentation = function() {
	
	var rep = GUI.svg.group(this.getAttribute('id'));
	
	GUI.svg.image(rep, 0, 0, 32, 32, this.getIconPath());
	
	this.renderFilename();

	rep.dataObject=this;

	this.initGUI(rep);
	
	return rep;
	
}



Exit.getFilename = function() {
	return this.getAttribute("name");
}

Exit.renderFilename = function (){
	
	var rep = this.getRepresentation();
	
    var filename = this.getFilename();
    var splitTextVal = splitSubstr(filename, 14);
    var cTexts = GUI.svg.createText();

    $(rep).find("text").remove();

    for(var i = 0, len = splitTextVal.length; i< len ; i++){
        cTexts.span(splitTextVal[i], {'y' : 78 + i * 14, 'x': 0});
    }
    var text = GUI.svg.text(rep, 0, 75, cTexts);
    $(text).attr("font-size", 12);

	/* center text */
	$(rep).find("text").find("tspan").each(function() {
	
		/* width of tspan elements is 0 in Firefox --> display multiline text left aligned in Firefox */
		if ($(rep).find("text").width() == 0) {
			var w = 0;
		} else {
			var w = 32-Math.floor($(this).width()/2);
		}
		
		$(this).attr("x", w);
		
	});

}


Exit.draw=function(external){
	
	var rep=this.getRepresentation();

	this.drawDimensions(external);
	
	$(rep).attr("layer", this.getAttribute('layer'));
	
	//$(rep).find("text").get(0).textContent = this.getAttribute('name');
	this.renderFilename();
	
}




