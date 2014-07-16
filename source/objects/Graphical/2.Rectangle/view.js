/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/
	
Rectangle.draw=function(external){

	var rep=this.getRepresentation();
	
	GeneralObject.draw.call(this, external);

	$(rep).attr("fill", this.getAttribute('fillcolor'));

	if (!$(rep).hasClass("selected")) {
		$(rep).attr("stroke", this.getAttribute('linecolor'));
		$(rep).attr("stroke-width", this.getAttribute('linesize'));
	}
	
	var label=this.getAttribute('label');
	if (!label) label='';
	
	rep.text.textContent=''+label;
	
	$(rep.text).attr("font-size", this.getAttribute('font-size'));
	$(rep.text).attr("font-family", this.getAttribute('font-family'));
	$(rep.text).attr("fill", this.getAttribute('font-color'));

}

/**
 * Sets the objects width
 * @param {int} value The new width
 */
Rectangle.setViewWidth = function(value) {
	var rep=this.getRepresentation();
	$(rep).attr("width", value);
	$(rep.rect).attr("width",value);
	
	var textX=0;
	var padding=5;
	var textWidth=rep.text.getBoundingClientRect().width;
	console.log(textWidth);
	
	switch (this.getAttribute('horizontal-align')){
		case 'left':textX=padding;break;
		case 'center':textX=(value-textWidth)/2;break;
		case 'right':textX=value-textWidth-padding;break;
	}
	
	console.log(textX);
	$(rep.text).attr("x",textX);
	
	GUI.adjustContent(this);
}

/**
 * Sets the objects height
 * @param {int} value The new height
 */
Rectangle.setViewHeight = function(value) {
	var rep=this.getRepresentation();
	$(rep).attr("height", value);
	$(rep.rect).attr("height",value);
	
	var textY=0;
	var padding=5;
	
	switch (this.getAttribute('vertical-align')){
		
		case 'above': textY=-padding;break;
		case 'top': textY=this.getAttribute('font-size')+padding;break;
		case 'middle': textY=(value)/2;break;
		case 'bottom': textY=value-padding;break;
		case 'under': textY=value+this.getAttribute('font-size');break;
		
	}
	
	$(rep.text).attr("y",textY);
	
	GUI.adjustContent(this);
}


Rectangle.createRepresentation = function(parent) {

    var rep = GUI.svg.group(parent,this.getAttribute('id'));

	rep.rect = GUI.svg.rect(rep,
		0, //x
		0, //y
		10, //width
		10 //height
	);
	
	rep.text=GUI.svg.text(rep, 0, 0, "Text");

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}