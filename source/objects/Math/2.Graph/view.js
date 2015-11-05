/**
*    Webarena - A webclient for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2011
*
*/


var myPlot;
var rep;
var svg;
Graph.draw=function(external){
	var rep=this.getRepresentation();
	this.drawDimensions(external);
}

Graph.createRepresentation = function(parent) {
	
	rep = GUI.svg.group(parent, this.getAttribute('id'));
	rep.foreign = GUI.svg.other(rep,"foreignObject",{x: 0, y: 30, width: 500, height: 500});	
	
	rep.dataObject=this;
	
	var body = document.createElement("body");
	var div = document.createElement("div");
	div.id = 'plot-'+this.getAttribute('id');
	
	$(div).css('width','500px');
	$(div).css('height','500px');
		
	$(body).append(div);
	$(rep.foreign).append(body);
	
	/*
     * TODO: Punkte an charakteristischen Punkten zum bewegen und stauchen des graphen? erstmal nur für quadratische Funktionen
     * nicht an dieser stelle.
     */
//	var point = [];
//	var pointplot = '1,1';
//	var coordinates = pointplot.split(',');
//	point.push([coordinates[0], coordinates[1]]);
//	myPlot.addPlot(point, FOOPLOT_TYPE_POINTS, {'color':'#000' });
	
     
	myPlot = new Fooplot(document.getElementById('plot-'+this.getAttribute('id')));
	
	var color = "#F00000";
	var term = this.getAttribute("term");
	var start;
	var terms = new Array([1]);
	var regExp = new RegExp('[+-]');
	
	
	
    myPlot.addPlot(term,FOOPLOT_TYPE_FUNCTION,{'color':'#FFF000'});
	
	svg = myPlot.getSVGBody();
	$(body).html(svg);
	
	
	rep.dataObject=this;
	

	this.initGUI(rep);
	
	return rep;
}

/**
 * Called when the colors of the appearence of an object are changed
 * @param {String} attribute attribute that was changed
 * @param {String} value new value of the attribute
 */
Graph.checkTransparency = function(attribute, value) {
	if (attribute === 'fillcolor') {
		var fillcolor = value;
	} else {
		var fillcolor = this.getAttribute('fillcolor');
	}
	if (attribute === 'font-color') {
		var fontcolor = value;
	} else {
		var fontcolor = this.getAttribute('font-color');
	}
	if (attribute === 'linecolor') {
		var linecolor = value;
	} else {
		var linecolor = this.getAttribute('linecolor');
	}
	if ((fillcolor === 'transparent' && linecolor === 'transparent' && fontcolor === 'transparent') || (fillcolor === 'transparent' && linecolor === 'transparent' && this.getContentAsString().trim() === '')) {
		return false;
	} else return true;
}


