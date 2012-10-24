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
		$(rep).attr("stroke", this.getAttribute('linecolor'));
		$(rep).attr("stroke-width", this.getAttribute('linesize'));
	}
	
	$(rep).attr("font-size", this.getAttribute('font-size'));
	$(rep).attr("font-family", this.getAttribute('font-family'));
	$(rep).attr("fill", this.getAttribute('font-color'));
	
	$(rep).attr("layer", this.getAttribute('layer'));


	var that=this;
	
	this.fetchContentString(function(data){
		
		if(data!=that.oldContent){
			rep.textContent=data;
			if (!data) rep.textContent='No text yet!';
		}
		
		that.oldContent=data;
		
	});

}



SimpleText.createRepresentation = function() {
	
	var rep = GUI.svg.text(10, 10, "Text");

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}




SimpleText.editText = function() {
	
	GUI.editText(this);
	
}


