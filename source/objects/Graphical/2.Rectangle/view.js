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
	
	rep.text.innerHTML='<table style="width:100%;"><tr><td style="height:'+this.getAttribute('height')+'px;vertical-align:'+this.getAttribute('vertical-align')+';text-align:'+this.getAttribute('horizontal-align')+'">'+label+'</td></tr></table>';
	
	rep.text.style.fontSize=this.getAttribute('font-size')+'px';
	rep.text.style.fontFamily=this.getAttribute('font-family');
	rep.text.style.color=this.getAttribute('font-color');

}

/**
 * Sets the objects width
 * @param {int} value The new width
 */
Rectangle.setViewWidth = function(value) {
	var rep=this.getRepresentation();
	$(rep).attr("width", value);
	$(rep.rect).attr("width",value);
	$(rep.text).attr("width",value);	
	var table=rep.text.getElementsByTagName('td')[0];
	
	if (table){
	
		table.style.textAlign=this.getAttribute('horizontal-align');
	}
		
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
	$(rep.text).attr("height",value);
	var table=rep.text.getElementsByTagName('td')[0];
	
	if (table){
	
		table.style.height=value+'px';
		table.style.verticalAlign=this.getAttribute('vertical-align');
	}
		
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
	
	rep.text=GUI.svg.other(rep,"foreignObject");
	
	var body = document.createElement("body");

	$(rep.text).append(body);

	rep.dataObject=this;

	$(rep).attr("id", this.getAttribute('id'));

	this.initGUI(rep);
	
	return rep;
	
}