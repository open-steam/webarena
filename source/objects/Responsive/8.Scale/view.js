/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2014
*
*/

Scale.moveByTransform = function(){return true;};
	
Scale.draw=function(external){

	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this, external);
	
	var rect=rep.getElementsByTagName('rect')[0];
	var line=rep.getElementsByTagName('line')[0];

	$(rect).attr("fill", this.getAttribute('fillcolor'));
	

	if (!$(rect).hasClass("selected")) {
		$(rect).attr("stroke", this.getAttribute('linecolor'));
		$(rect).attr("stroke-width", this.getAttribute('linesize'));
	}
	
	
	$(rect).attr('width',this.getAttribute('width'));
	$(rect).attr('height',this.getAttribute('height'));
	
	$(line).attr("stroke", this.getAttribute('linecolor'));
	$(line).attr("stroke-width", 5);
	
	this.padding=20;
	
	switch (this.getAttribute('orientation')){
		
		case 'left':
		
		$(line).attr("x1", this.padding);
		$(line).attr("y1", this.getAttribute('height')-this.padding);
		
		$(line).attr("x2", this.padding);
		$(line).attr("y2", this.padding+this.padding);
		
		break;
		
		case 'right':
		
		$(line).attr("x1", this.getAttribute('width')-this.padding);
		$(line).attr("y1", this.getAttribute('height')-this.padding);
		
		$(line).attr("x2", this.getAttribute('width')-this.padding);
		$(line).attr("y2", this.padding+this.padding);
		
		break;
		
		
		case 'top':
		
		$(line).attr("x1", this.padding);
		$(line).attr("y1", this.padding);
		
		$(line).attr("x2", this.getAttribute('width')-this.padding-this.padding);
		$(line).attr("y2", this.padding);
		
		break;
		
		
		default: 
		
		$(line).attr("x1", this.padding);
		$(line).attr("y1", this.getAttribute('height')-this.padding);
		
		$(line).attr("x2", this.getAttribute('width')-this.padding-this.padding);
		$(line).attr("y2", this.getAttribute('height')-this.padding);
		
		break;
		
	}
	
	var markerId = GUI.getSvgMarkerId("arrow", this.getAttribute("linecolor"), true);
	$(line).attr("marker-end", "url(#"+markerId+")");
	

}

Scale.createRepresentation = function(parent) {

	var rep = GUI.svg.group(parent,this.getAttribute('id'));

	rep.dataObject=this;

	var rect = GUI.svg.rect(rep,
		0, //x
		0, //y
		10, //width
		10 //height
	);
	
	var line=GUI.svg.line(rep, 0, 0, 20, 20, {});
 	var numbers = GUI.svg.group(rep);
 	
 	$(rect).addClass("rect");
 	$(line).addClass("line");
	$(numbers).addClass("numbers");

	this.initGUI(rep);
	
	return rep;
	
}